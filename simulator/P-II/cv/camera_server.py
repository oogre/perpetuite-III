#!/usr/bin/env python3 -u
# -*- coding: utf-8 -*-
"""
P-II.camera : capture + analyse + archive, a la demande.

Fusion de  P-III/src/computerVision/liveCV.py  (camera Daheng, gxipy)
      et   P-II/cv/server.py                   (analyse "P-II", serveur HTTP).

    python camera_server.py                 # vraie camera Daheng
    python camera_server.py --simulate      # fausse camera (test sans materiel)

Pourquoi c'est rapide
  * la camera reste ouverte, un thread ne fait que lire des images (pas de conversion,
    pas de traitement tant que personne ne demande rien) ;
  * a la demande : on attend la premiere image arrivee APRES la requete (jamais une image perimee),
    on la convertit une seule fois, on la reduit a 1000x1000 (le repere que l'analyse P-II attend)
    et seulement alors on l'analyse ;
  * l'archivage (reduction + JPEG + disque) se fait dans un autre thread, apres la reponse.

Routes (JSON, comme l'ancien server.py)
  POST /capture {"filename": "<t> <x> <y> <z>.png", "archive": true|false}
        -> prend une image de la camera, l'analyse, (l'archive), repond {"status","data","timing"}
  POST /upload  {"filename": "...", "image": "<base64>", "archive": false}
        -> meme analyse sur une image fournie (mode simulation de P-II, inchange)
  GET  /health  -> etat de la camera, du thread d'archivage et du disque
"""
import argparse
import base64
import json
import math
import os
import queue
import random
import signal
import sys
import threading
import time
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import cv2
import numpy as np

try:
    sys.stdout.reconfigure(line_buffering=True, encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(line_buffering=True, encoding='utf-8', errors='replace')
except Exception:
    pass


def log(*args):
    print(time.strftime('%H:%M:%S'), *args, flush=True)


try:
    import setproctitle
    setproctitle.setproctitle('P-II.camera')
except ImportError:  # optionnel, sert seulement a retrouver le processus avec pgrep
    pass


# ----------------------------------------------------------------------------- configuration
def env(name, default):
    return os.environ.get(name, default)


def parse_args():
    root = Path(__file__).resolve().parent.parent  # P-II/
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('--port', type=int, default=int(env('CAM_PORT', 8000)))
    p.add_argument('--host', default=env('CAM_HOST', '127.0.0.1'),
                   help="'0.0.0.0' pour etre joignable depuis WSL quand ce script tourne sous Windows")
    p.add_argument('--simulate', action='store_true', default=env('CAM_SIMULATE', '0') == '1',
                   help='fausse camera (scene de pilules synthetique)')
    # camera
    p.add_argument('--exposure', type=float, default=float(env('CAM_EXPOSURE', 10000.0)), help='microsecondes')
    p.add_argument('--gain', type=float, default=float(env('CAM_GAIN', 20.0)))
    p.add_argument('--gxipy-path', default=env('CAM_GXIPY_PATH', ''),
                   help="dossier qui CONTIENT gxipy/. Defaut : P-III/src/computerVision (le gxipy que liveCV.py utilisait) "
                        "si on le trouve, sinon le gxipy installe avec pip")
    p.add_argument('--settle-ms', type=int, default=int(env('CAM_SETTLE_MS', 0)),
                   help='attente supplementaire (vibrations) avant la prise')
    p.add_argument('--grab-timeout', type=float, default=float(env('CAM_GRAB_TIMEOUT', 3.0)), help='secondes')
    # geometrie : crop (repere capteur) -> reduction 1000x1000 -> rotation
    p.add_argument('--crop', default=env('CAM_CROP', ''),
                   help="x,y,taille dans le repere du capteur (carre). Defaut : plus grand carre centre")
    p.add_argument('--rotate', choices=['none', '90ccw', '90cw', '180'], default=env('CAM_ROTATE', '90ccw'),
                   help='liveCV.py faisait 90ccw')
    p.add_argument('--size', type=int, default=int(env('CAM_SIZE', 1000)),
                   help="cote de l'image analysee (1000 = le repere du canvas de P-II)")
    # archivage
    p.add_argument('--archive-dir', default=env('CAM_ARCHIVE_DIR', str(root / 'data' / 'archive')))
    p.add_argument('--archive-size', type=int, default=int(env('CAM_ARCHIVE_SIZE', 640)), help='cote en pixels')
    p.add_argument('--archive-quality', type=int, default=int(env('CAM_ARCHIVE_QUALITY', 80)), help='JPEG 1-100')
    p.add_argument('--archive-max-mb', type=int, default=int(env('CAM_ARCHIVE_MAX_MB', 0)),
                   help="plafond du dossier d'archive, les plus anciennes sont supprimees (0 = pas de plafond)")
    return p.parse_args()


# ----------------------------------------------------------------------------- cameras
def use_vendored_gxipy(cfg):
    """Place le gxipy de P-III en tete de sys.path (comme liveCV.py, qui l'importait depuis son propre dossier).

    Le paquet pip `open-gxipy` 2.0.x attend un pilote Galaxy recent (GXGetInterfaceNum) et plante avec
    un pilote plus ancien : NameError: gx_get_interface_number."""
    candidates = [Path(cfg.gxipy_path)] if cfg.gxipy_path else []
    here = Path(__file__).resolve()
    if len(here.parents) > 3:
        candidates.append(here.parents[3] / 'P-III' / 'src' / 'computerVision')
    for c in candidates:
        if (c / 'gxipy' / '__init__.py').exists():
            sys.path.insert(0, str(c))
            return str(c)
    return None


class DahengCamera:
    """Exactement les reglages de liveCV.py (createCamera)."""

    def __init__(self, exposure, gain):
        import gxipy as gx  # importe ici : inutile (et absent) en mode --simulate
        self.gx = gx
        self.exposure = exposure
        self.gain = gain
        self.manager = gx.DeviceManager()
        self.cam = None

    def open(self):
        gx = self.gx
        count, _ = self.manager.update_device_list()
        if count == 0:
            return False
        cam = self.manager.open_device_by_index(1)
        if cam.PixelColorFilter.is_implemented() is False:
            log('Camera monochrome non supportee')
            cam.close_device()
            return False
        cam.TriggerMode.set(gx.GxSwitchEntry.OFF)  # acquisition continue
        cam.ExposureAuto.set(False)
        cam.ExposureTime.set(self.exposure)
        cam.GainAuto.set(False)
        cam.Gain.set(self.gain)
        cam.data_stream[0].set_acquisition_buffer_number(3)
        cam.stream_on()
        self.cam = cam
        log('Camera OK')
        return True

    @property
    def is_open(self):
        return self.cam is not None

    def grab(self):
        """Image brute (non convertie) ou None."""
        return self.cam.data_stream[0].get_image()

    def decode(self, raw):
        """Image brute -> BGR OpenCV (une seule conversion, a la demande)."""
        rgb = raw.convert('RGB')
        if rgb is None:
            return None
        arr = rgb.get_numpy_array()
        if arr is None:
            return None
        return cv2.cvtColor(np.asarray(arr), cv2.COLOR_BGR2RGB)  # meme appel que liveCV.py

    def close(self):
        cam, self.cam = self.cam, None
        if cam is not None:
            try:
                cam.stream_off()
            except Exception:
                pass
            try:
                cam.close_device()
            except Exception:
                pass


class FakeCamera:
    """Scene synthetique : fond sombre, pilules colorees. ~15 images/s, 2448x2048 comme un capteur 5 Mpx."""
    W, H = 2448, 2048

    def __init__(self, fps=15.0):
        rng = random.Random(1)
        base = np.full((self.H, self.W, 3), 18, np.uint8)
        placed = []
        while len(placed) < 40:
            x, y, r = rng.randint(120, self.W - 120), rng.randint(120, self.H - 120), rng.randint(26, 32)
            if all((x - a) ** 2 + (y - b) ** 2 > (r + c + 30) ** 2 for a, b, c in placed):
                placed.append((x, y, r))
                color = tuple(int(v) for v in rng.choice([(40, 40, 220), (40, 200, 60), (230, 120, 30), (30, 200, 230), (200, 60, 200)]))
                cv2.circle(base, (x, y), r, color, -1, cv2.LINE_AA)
        self.base = base
        self.period = 1.0 / fps
        self.is_open = False

    def open(self):
        self.is_open = True
        return True

    def grab(self):
        time.sleep(self.period)
        return self.base.copy()

    def decode(self, raw):
        return raw

    def close(self):
        self.is_open = False


class Grabber(threading.Thread):
    """Lit la camera en continu et ne garde que la derniere image brute (aucune conversion ici)."""

    def __init__(self, camera):
        super().__init__(daemon=True, name='grabber')
        self.camera = camera
        self._cond = threading.Condition()
        self._frame = None  # (instant d'arrivee, image brute)
        self._halt = threading.Event()
        self.frames = 0
        self.reconnects = 0
        self.last_error = None

    def run(self):
        state = [None]

        def say(key, message):  # un message par changement d'etat, pas un toutes les secondes
            if state[0] != key:
                state[0] = key
                log('Camera :', message)

        while not self._halt.is_set():
            try:
                if not self.camera.is_open:
                    if not self.camera.open():
                        say('absent', 'aucune camera trouvee (nouvel essai chaque seconde)')
                        self._halt.wait(1.0)
                        continue
                    self.reconnects += 1
                    say('ok', 'ouverte, flux demarre')
                raw = self.camera.grab()
                if raw is None:  # meme logique que liveCV.py : on referme et on rouvre
                    self.camera.close()
                    say('lost', "plus d'image, on la rouvre")
                    self._halt.wait(0.2)
                    continue
            except Exception as e:  # une erreur du SDK ne doit JAMAIS tuer ce thread en silence
                self.camera.close()
                self.last_error = repr(e)
                say('error:' + repr(e), 'erreur %r (nouvel essai dans 1 s)' % e)
                self._halt.wait(1.0)
                continue
            with self._cond:
                self._frame = (time.monotonic(), raw)
                self.frames += 1
                self._cond.notify_all()
        self.camera.close()

    def wait_frame(self, after, timeout):
        """Premiere image arrivee strictement apres `after` (time.monotonic) ou None."""
        with self._cond:
            ok = self._cond.wait_for(lambda: self._frame is not None and self._frame[0] > after, timeout)
            return self._frame[1] if ok else None

    def stop(self):
        self._halt.set()


# ----------------------------------------------------------------------------- analyse (process P-II)
ERODE = 10  # erosionFactor de P-II/cv/server.py
KERNEL = np.ones((ERODE, ERODE), np.uint8)
KMEANS_CRITERIA = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.5)


def dominant_color(parcel):
    """Couleur dominante (2 groupes, on garde le plus gros). RGB entiers."""
    pixels = np.float32(parcel.reshape(-1, 3))
    if len(pixels) < 2:
        b, g, r = pixels[0]
        return int(r), int(g), int(b)
    _, labels, palette = cv2.kmeans(pixels, 2, None, KMEANS_CRITERIA, 3, cv2.KMEANS_PP_CENTERS)
    b, g, r = palette[np.argmax(np.bincount(labels.ravel(), minlength=2))]
    return int(r), int(g), int(b)


def pill_to_obj(contour, img):
    """Meme sortie que Pill.toObj() de P-II/cv/Pill.py : contour, box [cx, cy, w, h], avgRGB."""
    x, y, w, h = cv2.boundingRect(contour)
    bw, bh = w + ERODE, h + ERODE
    parcel = img[y:y + bh, x:x + bw]
    return {
        'contour': contour.reshape(-1, 2).tolist(),  # (squeeze() cassait les contours d'1 point)
        'box': [int(x - ERODE / 2) + bw / 2, int(y - ERODE / 2) + bh / 2, bw, bh],
        'avgRGB': list(dominant_color(parcel)),
    }


def analyse(img):
    """img : BGR, repere d'analyse. Memes seuils et memes noyaux que P-II/cv/server.py."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (11, 11), 0)
    _, thresh1 = cv2.threshold(blur, 48, 255, cv2.THRESH_BINARY)
    erosion = cv2.erode(thresh1, KERNEL, iterations=1)
    blur = cv2.GaussianBlur(erosion, (9, 9), 0)
    _, thresh2 = cv2.threshold(blur, 68, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(thresh2, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    return [pill_to_obj(c, img) for c in contours]


# ----------------------------------------------------------------------------- geometrie
ROTATIONS = {'90ccw': cv2.ROTATE_90_COUNTERCLOCKWISE, '90cw': cv2.ROTATE_90_CLOCKWISE, '180': cv2.ROTATE_180}


def to_analysis_frame(img, cfg):
    """capteur -> carre -> size x size -> rotation. On reduit AVANT de tourner (bien moins de pixels a copier)."""
    h, w = img.shape[:2]
    if cfg.crop:
        x, y, s = [int(v) for v in cfg.crop.split(',')]
    else:
        s = min(h, w)
        x, y = (w - s) // 2, (h - s) // 2
    img = img[y:y + s, x:x + s]
    if s != cfg.size:
        img = cv2.resize(img, (cfg.size, cfg.size), interpolation=cv2.INTER_AREA)
    if cfg.rotate != 'none':
        img = cv2.rotate(img, ROTATIONS[cfg.rotate])
    return img


# ----------------------------------------------------------------------------- archivage
class Archiver(threading.Thread):
    """Reduit, encode en JPEG et ecrit sur disque en arriere-plan.

    Arborescence lue par ImageManager de P-II : <archive>/<annee>/<MM.JJ>/<heure>/<nom>
    (le nom `<timestamp> <x> <y> <z>` est conserve, seule l'extension devient .jpg)."""

    def __init__(self, cfg):
        super().__init__(daemon=True, name='archiver')
        self.cfg = cfg
        self.root = Path(cfg.archive_dir)
        self.q = queue.Queue(maxsize=32)
        self.written = 0
        self.dropped = 0
        self.last_error = None

    def submit(self, filename, img):
        try:
            self.q.put_nowait((filename, img))
        except queue.Full:  # le disque ne suit pas : on prefere perdre une archive que ralentir le robot
            self.dropped += 1

    def path_for(self, filename):
        stem = Path(Path(filename).name).stem  # nom sans dossier ni extension (pas d'evasion avec ../)
        try:
            when = datetime.fromtimestamp(int(stem.split(' ')[0]) / 1000.0)
        except (ValueError, OverflowError, OSError):
            when = datetime.now()
        folder = self.root / str(when.year) / when.strftime('%m.%d') / str(when.hour)
        return folder / (stem + '.jpg')

    def run(self):
        self.prune()
        while True:
            filename, img = self.q.get()
            try:
                small = cv2.resize(img, (self.cfg.archive_size,) * 2, interpolation=cv2.INTER_AREA)
                dest = self.path_for(filename)
                dest.parent.mkdir(parents=True, exist_ok=True)
                tmp = dest.with_name('.' + dest.name)  # ImageManager ignore les noms qui commencent par un point
                if not cv2.imwrite(str(tmp), small, [cv2.IMWRITE_JPEG_QUALITY, self.cfg.archive_quality]):
                    raise IOError('cv2.imwrite a echoue : ' + str(tmp))
                os.replace(tmp, dest)
                self.written += 1
                if self.cfg.archive_max_mb and self.written % 200 == 0:
                    self.prune()
            except Exception as e:  # ne jamais tuer le thread
                self.last_error = str(e)
                log('Archive :', e)

    def prune(self):
        limit = self.cfg.archive_max_mb * 1024 * 1024
        if not limit or not self.root.exists():
            return
        files = []
        for p in self.root.rglob('*.jpg'):
            try:
                st = p.stat()
                files.append((st.st_mtime, st.st_size, p))
            except OSError:
                pass
        total = sum(f[1] for f in files)
        for _, size, p in sorted(files):  # les plus anciennes d'abord
            if total <= limit * 0.9:  # on descend a 90 % pour ne pas relancer tout de suite
                break
            try:
                p.unlink()
                total -= size
            except OSError:
                pass


# ----------------------------------------------------------------------------- HTTP
class Context:
    pass


CTX = Context()


def json_response(handler, code, payload):
    body = json.dumps(payload).encode('utf-8')
    handler.send_response(code)
    handler.send_header('Access-Control-Allow-Origin', '*')
    handler.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    handler.send_header('Content-Type', 'application/json')
    handler.send_header('Content-Length', str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


class Handler(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'  # connexions persistantes (pas de nouvelle connexion TCP a chaque capture)

    def log_message(self, *args):
        pass

    def do_OPTIONS(self):
        json_response(self, 200, {})

    def do_GET(self):
        if self.path == '/health':
            cfg, grabber, archiver = CTX.cfg, CTX.grabber, CTX.archiver
            free = None
            try:
                import shutil
                root = Path(cfg.archive_dir)
                while not root.exists() and root != root.parent:
                    root = root.parent
                free = shutil.disk_usage(root).free // (1024 * 1024)
            except OSError:
                pass
            return json_response(self, 200, {
                'status': 'success',
                'camera': 'simulate' if cfg.simulate else 'daheng',
                'cameraOpen': bool(grabber.camera.is_open),
                'frames': grabber.frames,
                'reconnects': grabber.reconnects,
                'cameraError': grabber.last_error,
                'archive': {'written': archiver.written, 'dropped': archiver.dropped,
                            'queued': archiver.q.qsize(), 'lastError': archiver.last_error, 'freeMB': free},
            })
        json_response(self, 200, {'status': 'success', 'routes': ['POST /capture', 'POST /upload', 'GET /health']})

    def do_POST(self):
        t0 = time.monotonic()
        try:
            length = int(self.headers.get('Content-Length') or 0)
            data = json.loads(self.rfile.read(length).decode('utf-8') or '{}')
        except Exception as e:
            return json_response(self, 400, {'status': 'error', 'message': 'JSON invalide : %s' % e})
        cfg = CTX.cfg
        filename = data.get('filename') or ('%d.png' % int(time.time() * 1000))
        archive = bool(data.get('archive'))
        timing = {}
        try:
            if self.path == '/capture':
                with CTX.capture_lock:  # une seule camera : les captures passent l'une apres l'autre
                    if cfg.settle_ms:
                        time.sleep(cfg.settle_ms / 1000.0)
                    t_req = time.monotonic() if cfg.settle_ms else t0
                    raw = CTX.grabber.wait_frame(t_req, cfg.grab_timeout)
                    if raw is None:
                        return json_response(self, 503, {'status': 'error', 'message': 'Pas d\'image de la camera'})
                    t1 = time.monotonic()
                    img = CTX.camera.decode(raw)
                    if img is None:
                        return json_response(self, 500, {'status': 'error', 'message': 'Conversion de l\'image impossible'})
                    frame = to_analysis_frame(img, cfg)
                    timing['grab_ms'] = round((t1 - t0) * 1000, 1)
                    timing['prepare_ms'] = round((time.monotonic() - t1) * 1000, 1)
            elif self.path == '/upload':
                if not data.get('image'):
                    return json_response(self, 400, {'status': 'error', 'message': 'Aucune image fournie'})
                buf = np.frombuffer(base64.b64decode(data['image']), np.uint8)
                frame = cv2.imdecode(buf, cv2.IMREAD_COLOR)  # le canvas de P-II : deja au bon repere
                if frame is None:
                    return json_response(self, 400, {'status': 'error', 'message': 'Image illisible'})
            else:
                return json_response(self, 404, {'status': 'error', 'message': 'Endpoint non trouve'})

            t2 = time.monotonic()
            result = analyse(frame)
            timing['analyse_ms'] = round((time.monotonic() - t2) * 1000, 1)
            timing['total_ms'] = round((time.monotonic() - t0) * 1000, 1)
            json_response(self, 200, {
                'status': 'success',
                'message': 'ok',
                'data': result,
                'timing': timing,
            })
            if archive:  # apres la reponse : le robot n'attend pas le disque
                CTX.archiver.submit(filename, frame)
        except (BrokenPipeError, ConnectionResetError):
            pass
        except Exception as e:
            log('Erreur :', repr(e))
            try:
                json_response(self, 500, {'status': 'error', 'message': str(e)})
            except Exception:
                pass


class Server(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def main():
    log('MAIN')
    cfg = parse_args()
    cv2.setNumThreads(max(1, (os.cpu_count() or 2) - 1))  # laisse un coeur a Node
    CTX.cfg = cfg
    if cfg.simulate:
        CTX.camera = FakeCamera()
    else:
        try:
            CTX.camera = DahengCamera(cfg.exposure, cfg.gain)
        except Exception as e:
            log("Impossible de charger gxipy : %r" % e)
            log("  -> pilote Daheng Galaxy installe ? gxipy trouve dans P-III/src/computerVision ? (option --gxipy-path)")
            sys.exit(1)
    CTX.grabber = Grabber(CTX.camera)
    CTX.archiver = Archiver(cfg)
    CTX.capture_lock = threading.Lock()
    CTX.grabber.start()
    CTX.archiver.start()

    def on_term(*_):
        raise KeyboardInterrupt  # kill / systemd : meme arret propre que Ctrl+C
    signal.signal(signal.SIGTERM, on_term)

    httpd = Server((cfg.host, cfg.port), Handler)
    log('P-II.camera sur http://%s:%d  (%s)  archive : %s' % (
        cfg.host, cfg.port, 'camera simulee' if cfg.simulate else 'camera Daheng', cfg.archive_dir))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        log('Arret')
    finally:
        httpd.server_close()
        CTX.grabber.stop()
        CTX.grabber.join(timeout=3)
        for _ in range(50):  # laisse l'archiveur finir ce qui est en attente
            if CTX.archiver.q.empty():
                break
            time.sleep(0.1)


if __name__ == '__main__':
    main()
