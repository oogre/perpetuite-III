#!/usr/bin/env python3
# Le script simple (bruit + longueur d'arc, FLOW pixels nouveaux par index) lancé 3 fois : rouge, vert, bleu,
# chacun avec sa graine. On additionne ensuite les trois images de pixels nouveaux.
# Mode offset incrémental : l'état est gardé dans data/patterns/state.npz (un seul pas par appel).
#   python3 ./Generator/main.py 12      -> data/patterns/draw.diff.png de l'index 12 (fond transparent)
#   python3 ./Generator/main.py loop    -> aperçu (fond noir)
import os
import sys
import cv2
import numpy as np
from noise import pnoise3
from pathlib import Path

WIDTH = HEIGHT = 200
FLOW = 300            # pixels nouvellement allumés par index, dans chaque couleur (constant)
COVERAGE = 0.30       # part de l'image allumée dans chaque couche (constante)
LAYERS = [((255, 0, 0), 0), ((0, 255, 0), 11), ((0, 0, 255), 23)]    # (couleur RGB, graine)
SPACE = 0.005         # échelle spatiale du bruit

XS, YS = np.meshgrid(np.arange(WIDTH) * SPACE, np.arange(HEIGHT) * SPACE)
POINTS = list(zip(XS.ravel().tolist(), YS.ravel().tolist()))

def lit(seed, t):
	"""pixels allumés à l'instant t : les COVERAGE plus hauts du bruit -> toujours le même nombre. Renvoie aussi la marge."""
	f = np.array([pnoise3(x, y, t, 1, 0.5, 2.0, 1024, 1024, 1024, seed) for x, y in POINTS]).reshape(HEIGHT, WIDTH)
	k = int(round(COVERAGE * f.size))
	margin = f - np.partition(f.ravel(), f.size - k)[f.size - k]
	return margin >= 0, margin

def advance(seed, t, mask, guess):
	"""avance jusqu'à l'instant où EXACTEMENT FLOW pixels de plus sont allumés (vitesse constante)"""
	dt = guess
	for _ in range(6):
		m, margin = lit(seed, t + dt)
		n = int((m & ~mask).sum())
		if abs(n - FLOW) <= 2:
			break
		dt *= FLOW / max(n, 1)
	extra = n - FLOW
	if extra > 0:    # trop de nouveaux : on retire les plus faibles
		m.ravel()[np.argsort(np.where(m & ~mask, margin, np.inf), axis=None)[:extra]] = False
	elif extra < 0:  # pas assez : on allume les plus proches du seuil
		m.ravel()[np.argsort(np.where(m | mask, np.inf, -margin), axis=None)[:-extra]] = True
	return t + dt, m, dt

STATE = Path('./data/patterns/state.npz')   # dernier index calculé : l'index suivant ne coûte alors qu'UN pas
SIGNATURE = np.array([WIDTH, HEIGHT, FLOW, COVERAGE, SPACE] + [seed for _, seed in LAYERS])   # réglages -> cache invalide s'ils changent

def initial():
	"""état avant l'index 0 : instant t et pas dt de chaque couche, masque allumé (courant et précédent)"""
	masks = np.array([lit(seed, 0.0)[0] for _, seed in LAYERS])
	return dict(offset=-1, t=np.zeros(3), dt=np.full(3, 0.005), prev=masks, cur=masks.copy())

def step(s):
	"""passe de l'index N-1 à l'index N : un pas par couche"""
	new = dict(offset=s['offset'] + 1, t=s['t'].copy(), dt=s['dt'].copy(), prev=s['cur'], cur=s['cur'].copy())
	for c, (_, seed) in enumerate(LAYERS):
		new['t'][c], new['cur'][c], new['dt'][c] = advance(seed, s['t'][c], s['cur'][c], s['dt'][c])
	return new

def image(s):
	"""image RGB (h, w, 3) additionnée des trois couches : leurs pixels nouveaux, chacun dans sa couleur"""
	rgb = np.zeros((HEIGHT, WIDTH, 3), np.int32)
	for c, (color, _) in enumerate(LAYERS):
		rgb += (s['cur'][c] & ~s['prev'][c])[..., None] * np.array(color, np.int32)
	return np.clip(rgb, 0, 255).astype(np.uint8)

def save(s):
	tmp = STATE.with_name('state.tmp.npz')
	np.savez(tmp, signature=SIGNATURE, **s)
	os.replace(tmp, STATE)                  # écriture atomique : jamais de fichier à moitié écrit

def stateFor(offset):
	"""état à l'index `offset`. Reprend state.npz : déjà à `offset` -> rien à calculer ; à `offset - 1` -> un seul pas ;
	absent, illisible, réglages changés ou autre index -> on rejoue tout depuis 0 (plus lent, même résultat)."""
	try:
		f = np.load(STATE)
		if np.array_equal(f['signature'], SIGNATURE):
			s = {k: f[k] for k in ('t', 'dt', 'prev', 'cur')}
			s['offset'] = int(f['offset'])
			if s['offset'] == offset:
				return s
			if s['offset'] == offset - 1:
				s = step(s); save(s)
				return s
	except Exception:
		pass
	s = initial()
	for _ in range(offset + 1):
		s = step(s)
	save(s)
	return s

def frames():
	"""loop : une image par pas, tout reste en mémoire"""
	s = initial()
	while True:
		s = step(s)
		yield image(s)

def png(rgb):
	"""fond transparent : alpha 255 là où une couche a allumé un pixel"""
	out = np.zeros((HEIGHT, WIDTH, 4), np.uint8)
	lit_ = rgb.any(axis=2)
	out[lit_, :3] = rgb[lit_][:, ::-1]      # BGR pour cv2
	out[lit_, 3] = 255
	return out

if len(sys.argv) > 1 and sys.argv[1] == 'loop':
	for rgb in frames():                    # fond noir : les pixels éteints restent noirs
		cv2.imshow('generator', cv2.resize(rgb[..., ::-1], (400, 400), interpolation=cv2.INTER_NEAREST))
		if cv2.waitKey(1) == 27:
			break
else:
	n = int(sys.argv[1]) if len(sys.argv) > 1 else 0
	STATE.parent.mkdir(parents=True, exist_ok=True)
	cv2.imwrite(str(STATE.parent / 'draw.diff.png'), png(image(stateFor(n))))