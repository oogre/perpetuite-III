"""Detection des pills par transformee de distance (remplace analyse() de camera_server.py).
Meme sortie : liste de {'contour': [[x, y], ...], 'box': [cx, cy, w, h], 'avgRGB': [r, g, b]}.
 - une pill = un disque (centre + rayon) inscrit dans la forme : un trou, un reflet ou une pill voisine ne le deforme pas
 - tout ce qui reste dans le masque une fois les disques retires = objet etranger (renvoye avec son vrai contour)
"""
import cv2
import numpy as np

ERODE = 10                    # meme valeur que camera_server.py : sert a garder les memes boites que l'ancienne analyse
SCALE = 1.0                   # taille de l'image d'analyse / 1000 (CAM_SIZE)
PX_PER_MM = 5.3205
R_MIN = 13.0 * SCALE          # PILL_MIN_RADIUS 2.5 mm
R_MAX = 32.0 * SCALE          # PILL_MAX_RADIUS 6 mm
RING_MAX = 0.35               # part tolérée de matiere autour du disque (voisines qui se touchent) ; une barre ou une tache l'excede
CONTOUR_SHRINK = 4.5 * SCALE  # le contour renvoye est plus petit que le disque, comme avant (erosion 10x10 : mesure sur 1400 pills)
MIN_BLOB_PX = 280 * SCALE**2  # en dessous (~10 mm², la moitie d'une pill) : bruit, ni pill ni obstacle
COLOR_BIAS = (3, 3, 2)        # la mediane du disque est un peu plus claire que l'ancien kmeans de la boite : on retire l'ecart mesure (palette inchangee)
KERNEL_CLOSE = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
KERNEL_OPEN = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))


def fill_holes(mask):
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    out = np.zeros_like(mask)
    cv2.drawContours(out, contours, -1, 255, cv2.FILLED)
    return out


def circle_contour(cx, cy, r, n=32):
    a = np.linspace(0, 2 * np.pi, n, endpoint=False)
    return np.stack([np.round(cx + r * np.cos(a)), np.round(cy + r * np.sin(a))], 1).astype(int).tolist()


def inner_median_rgb(img, cx, cy, r):
    """couleur moyenne du disque interieur (60 % du rayon) : ni bord, ni reflet de bord, ni fond"""
    x0, y0 = max(int(cx - r), 0), max(int(cy - r), 0)
    crop = img[y0:int(cy + r) + 1, x0:int(cx + r) + 1]
    m = np.zeros(crop.shape[:2], np.uint8)
    cv2.circle(m, (int(round(cx)) - x0, int(round(cy)) - y0), max(int(0.6 * r), 1), 255, cv2.FILLED)
    b, g, rr, _ = cv2.mean(crop, m)
    return [max(int(rr) - COLOR_BIAS[0], 0), max(int(g) - COLOR_BIAS[1], 0), max(int(b) - COLOR_BIAS[2], 0)]


def _box_sum(integral, cx, cy, half):
    h, w = integral.shape[0] - 1, integral.shape[1] - 1
    x0, x1 = max(int(cx - half), 0), min(int(cx + half) + 1, w)
    y0, y1 = max(int(cy - half), 0), min(int(cy + half) + 1, h)
    if x1 <= x0 or y1 <= y0:
        return 0
    return integral[y1, x1] - integral[y0, x1] - integral[y1, x0] + integral[y0, x0]


def ring_fill(integral, cx, cy, r):
    """part de matiere dans le cadre carre [1,15 r ; 1,35 r] autour du disque (8 lectures dans l'image integrale)"""
    outer, inner = 1.35 * r, 1.15 * r
    material = _box_sum(integral, cx, cy, outer) - _box_sum(integral, cx, cy, inner)
    return float(material) / ((2 * outer + 1) ** 2 - (2 * inner + 1) ** 2)


def analyse(img):
    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (11, 11), 0)
    _, mask = cv2.threshold(blur, 48, 255, cv2.THRESH_BINARY)
    mask = fill_holes(cv2.morphologyEx(mask, cv2.MORPH_CLOSE, KERNEL_CLOSE))

    # bord de l'image = fond : une pill coupee a un rayon plus petit, elle ne passe pas pour une pill entiere
    # distance et maxima sur une image reduite de moitie (4 fois moins de pixels) ; centre et rayon sont remis a l'echelle
    small = cv2.resize(mask, (w // 2, h // 2), interpolation=cv2.INTER_AREA)
    _, small = cv2.threshold(small, 127, 255, cv2.THRESH_BINARY)
    dist = cv2.distanceTransform(cv2.copyMakeBorder(small, 1, 1, 1, 1, cv2.BORDER_CONSTANT, value=0), cv2.DIST_L2, 5)[1:-1, 1:-1]
    r_min_s = R_MIN / 2
    k = int(2 * r_min_s) + 1
    peaks = ((dist >= r_min_s) & (dist == cv2.dilate(dist, np.ones((k, k), np.uint8)))).astype(np.uint8)
    n, lab = cv2.connectedComponents(peaks)                         # un plateau de maxima = une seule pill
    ys, xs = np.nonzero(peaks)                                       # on ne travaille que sur les pixels-maxima (pas sur toute l'image)
    ids = lab[ys, xs]
    count = np.bincount(ids, minlength=n)
    cxs = (np.bincount(ids, xs, minlength=n) / np.maximum(count, 1) + 0.5) * 2 - 0.5     # retour a l'echelle 1
    cys = (np.bincount(ids, ys, minlength=n) / np.maximum(count, 1) + 0.5) * 2 - 0.5
    rs = np.zeros(n)
    np.maximum.at(rs, ids, dist[ys, xs])
    rs *= 2
    integral = cv2.integral((mask > 0).astype(np.uint8))
    cand = []
    for i in range(1, n):
        cx, cy, r = cxs[i], cys[i], float(rs[i])
        if R_MIN <= r <= R_MAX and ring_fill(integral, cx, cy, r) <= RING_MAX:
            cand.append((r, cx, cy))
    cand.sort(reverse=True)                                          # les plus gros d'abord, on retire les doublons
    discs = []
    for r, cx, cy in cand:
        if all((cx - c[1]) ** 2 + (cy - c[2]) ** 2 >= (0.8 * max(r, c[0])) ** 2 for c in discs):
            discs.append((r, cx, cy))

    out = []
    for r, cx, cy in discs:
        rc = max(r - CONTOUR_SHRINK, 1.0)
        size = 2 * rc + ERODE
        out.append({
            'contour': circle_contour(cx, cy, rc),
            'box': [float(cx), float(cy), size, size],
            'avgRGB': inner_median_rgb(img, cx, cy, r),
        })

    # objets etrangers : ce qui reste du masque une fois les disques retires
    covered = np.zeros_like(mask)
    for r, cx, cy in discs:
        cv2.circle(covered, (int(round(cx)), int(round(cy))), int(r) + 4, 255, cv2.FILLED)
    rest = cv2.morphologyEx(cv2.bitwise_and(mask, cv2.bitwise_not(covered)), cv2.MORPH_OPEN, KERNEL_OPEN)
    contours, _ = cv2.findContours(rest, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    pill_area = np.pi * (20 * SCALE) ** 2
    for c in contours:
        area = cv2.contourArea(c)
        x, y, bw, bh = cv2.boundingRect(c)
        if area < MIN_BLOB_PX:
            continue
        touches = x <= 1 or y <= 1 or x + bw >= w - 1 or y + bh >= h - 1
        if touches and area < 3 * pill_area:                          # fragment tronque par le bord : on ne peut pas juger
            continue
        parcel = img[y:y + bh + ERODE, x:x + bw + ERODE]
        out.append({
            'contour': c.reshape(-1, 2).tolist(),
            'box': [x + bw / 2, y + bh / 2, bw + ERODE, bh + ERODE],
            'avgRGB': list(_dominant(parcel)),
        })
    return out


def _dominant(parcel):
    pixels = np.float32(parcel.reshape(-1, 3))
    if len(pixels) < 2:
        b, g, r = pixels[0]
        return int(r), int(g), int(b)
    crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.5)
    _, labels, palette = cv2.kmeans(pixels, 2, None, crit, 3, cv2.KMEANS_PP_CENTERS)
    b, g, r = palette[np.argmax(np.bincount(labels.ravel(), minlength=2))]
    return int(r), int(g), int(b)