# Assemble les images d'archive de la caméra en une seule mosaïque, empilées sans fusion (la plus récente est dessus).
#   python3 mosaic_empile.py data/archive/2026/10.25 sortie/mosaique_empilee
#   -> sortie.png (mosaïque complète), sortie.json (conversion pixel <-> mm robot), sortie_apercu.jpg
# Les images sont dans des sous-dossiers (0, 1, 10 ...), nommées "<temps> <x> <y> ....jpg" (x, y = pose du robot en mm).
import os, sys, json, numpy as np, cv2
SRC = sys.argv[1]; OUT = sys.argv[2]
S = 5.3205                       # px/mm (CAMERA_PX_PER_MM)
NX, NY = 500 + 23, 500 + 303     # pixel de la buse (centre + CAMERA_OFFSET)
files = []
for d in sorted(os.listdir(SRC), key=lambda s: (not s.isdigit(), int(s) if s.isdigit() else 0)):
    p = os.path.join(SRC, d)
    if os.path.isdir(p):
        for f in os.listdir(p):
            if f.lower().endswith('.jpg'):
                t, x, y, *_ = f[:-4].split(' ')
                files.append((int(t), float(x), float(y), os.path.join(p, f)))
files.sort()                                      # ordre d'empilement : par temps croissant
xs = [f[1] for f in files]; ys = [f[2] for f in files]
x0, y0 = min(xs), min(ys)                         # coin haut-gauche du canevas = pose du robot (x0, y0), buse comprise
W = int(round((max(xs) - x0) * S)) + 1000
H = int(round((max(ys) - y0) * S)) + 1000
canvas = np.zeros((H, W, 3), np.uint8)
for i, (t, x, y, path) in enumerate(files):
    im = cv2.imread(path)
    if im is None: print('illisible', path); continue
    h, w = im.shape[:2]
    cx = int(round((x - x0) * S))                 # la buse est en (cx + NX, cy + NY) dans le canevas
    cy = int(round((y - y0) * S))
    roi = canvas[cy:cy + h, cx:cx + w]
    roi[:] = im[:roi.shape[0], :roi.shape[1]]     # on écrase : pas de filtre de fusion
    if i % 500 == 0: print(i, len(files), flush=True)
cv2.imwrite(OUT + '.png', canvas, [cv2.IMWRITE_PNG_COMPRESSION, 6])
meta = dict(images=len(files), width=W, height=H, px_per_mm=S, nozzle_px=[NX, NY],
            note="pixel canevas (u,v) <-> mm robot : x = x0 + (u - NX)/px_per_mm, y = y0 + (v - NY)/px_per_mm", x0=x0, y0=y0)
json.dump(meta, open(OUT + '.json', 'w'), indent=1)
small = cv2.resize(canvas, (1800, int(1800 * H / W)), interpolation=cv2.INTER_AREA)
cv2.imwrite(OUT + '_apercu.jpg', small, [cv2.IMWRITE_JPEG_QUALITY, 90])
print(meta)
