// extractPaths.js : lignes médianes des tracés rouge / vert / bleu d'un PNG (traits fins, fragmentés)
// usage : node extractPaths.js image.png [saut=14] [tolerance=1] [longueurMin=10]
import { PNG } from 'pngjs';
import fs from 'fs';

const COLORS = { rouge: [255, 0, 0], vert: [0, 255, 0], bleu: [0, 0, 255] };

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// 1) pixels de chaque couleur -> points (centre du pixel)
function readMasks(file) {
	const png = PNG.sync.read(fs.readFileSync(file));
	const out = {};
	for (const name in COLORS) out[name] = [];
	for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
		const i = (y * png.width + x) * 4;
		if (png.data[i + 3] === 0) continue;                       // transparent
		for (const name in COLORS) {
			const c = COLORS[name];
			if (Math.abs(png.data[i] - c[0]) + Math.abs(png.data[i + 1] - c[1]) + Math.abs(png.data[i + 2] - c[2]) < 60)
				out[name].push([x + 0.5, y + 0.5]);
		}
	}
	return { points: out, width: png.width, height: png.height };
}

// 2) arêtes entre points distants de moins de `gap` (grille spatiale pour éviter le n²)
function neighbours(pts, gap) {
	const cell = new Map(), key = (cx, cy) => cx + ',' + cy, edges = [];
	pts.forEach((p, i) => {
		const k = key(Math.floor(p[0] / gap), Math.floor(p[1] / gap));
		if (!cell.has(k)) cell.set(k, []);
		cell.get(k).push(i);
	});
	pts.forEach((p, i) => {
		const cx = Math.floor(p[0] / gap), cy = Math.floor(p[1] / gap);
		for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++)
			for (const j of cell.get(key(cx + dx, cy + dy)) || [])
				if (j > i) { const d = dist(p, pts[j]); if (d <= gap) edges.push([i, j, d]); }
	});
	return edges;
}

// 3) arbre couvrant minimal (Kruskal) : relie les fragments sans raccourcis ; chaque arbre = un groupe
function spanningForest(n, edges) {
	const parent = Array.from({ length: n }, (_, i) => i);
	const find = i => (parent[i] === i ? i : (parent[i] = find(parent[i])));
	const adj = Array.from({ length: n }, () => []);
	for (const [a, b, d] of edges.sort((u, v) => u[2] - v[2])) {
		const ra = find(a), rb = find(b);
		if (ra === rb) continue;
		parent[ra] = rb;
		adj[a].push([b, d]); adj[b].push([a, d]);
	}
	return adj;
}

// parcours de l'arbre depuis `start` : distance (le long de l'arbre) et prédécesseur de chaque nœud atteint
function walk(adj, start, allowed) {
	const dist = new Map([[start, 0]]), prev = new Map(), stack = [start];
	while (stack.length) {
		const u = stack.pop();
		for (const [v, d] of adj[u]) if (allowed.has(v) && !dist.has(v)) {
			dist.set(v, dist.get(u) + d); prev.set(v, u); stack.push(v);
		}
	}
	return { dist, prev };
}
const farthest = ({ dist }) => [...dist].reduce((a, b) => (b[1] > a[1] ? b : a))[0];

// chemin le plus long (diamètre) d'un arbre restreint aux nœuds `allowed`
function longestPath(adj, allowed) {
	const first = allowed.values().next().value;
	const a = farthest(walk(adj, first, allowed));
	const w = walk(adj, a, allowed), b = farthest(w);
	const path = [b];
	while (w.prev.has(path[path.length - 1])) path.push(w.prev.get(path[path.length - 1]));
	return path;                                                   // de b vers a
}

// 4) ligne médiane : tous les points proches du chemin sont moyennés par tranche de `step` px d'abscisse curviligne
function centerline(pts, members, path, step = 3) {
	const spine = path.map(i => pts[i]), s = [0];
	for (let k = 1; k < spine.length; k++) s.push(s[k - 1] + dist(spine[k - 1], spine[k]));
	const bins = new Map();
	for (const p of members.map(i => pts[i])) {
		let best = 0, bd = Infinity;
		spine.forEach((q, k) => { const d = dist(p, q); if (d < bd) { bd = d; best = k; } });
		const t = Math.round(s[best] / step);
		const b = bins.get(t) || [0, 0, 0];
		b[0] += p[0]; b[1] += p[1]; b[2]++; bins.set(t, b);
	}
	return [...bins].sort((a, b) => a[0] - b[0]).map(([, b]) => [b[0] / b[2], b[1] / b[2]]);
}

// 5) Douglas-Peucker
function simplify(p, eps) {
	if (p.length < 3) return p;
	const [a, b] = [p[0], p[p.length - 1]], L = dist(a, b) || 1e-9;
	let imax = 0, dmax = 0;
	for (let i = 1; i < p.length - 1; i++) {
		const d = Math.abs((b[0] - a[0]) * (a[1] - p[i][1]) - (a[0] - p[i][0]) * (b[1] - a[1])) / L;
		if (d > dmax) { dmax = d; imax = i; }
	}
	if (dmax <= eps) return [a, b];
	return simplify(p.slice(0, imax + 1), eps).slice(0, -1).concat(simplify(p.slice(imax), eps));
}
const length = p => p.reduce((s, q, i) => s + (i ? dist(p[i - 1], q) : 0), 0);

export function extractPaths(file, gap = 14, eps = 1, minLength = 10) {
	const { points, width, height } = readMasks(file), paths = {};
	for (const name in points) {
		const pts = points[name];
		const adj = spanningForest(pts.length, neighbours(pts, gap));
		const seen = new Set();
		paths[name] = [];
		for (let start = 0; start < pts.length; start++) {
			if (seen.has(start)) continue;
			const group = new Set(walk(adj, start, new Set(pts.keys())).dist.keys());
			group.forEach(i => seen.add(i));
			let rest = group;                                      // tronc, puis branches avec ce qui reste
			while (rest.size >= 3) {
				const path = longestPath(adj, rest);
				const line = centerline(pts, [...rest], path);
				if (line.length < 2) break;
				if (length(line) >= minLength) paths[name].push(simplify(line, eps));
				//rest = new Set([...rest].filter(i => Math.min(...line.map(q => dist(pts[i], q))) > 3));
				const onPath = new Set(path);   // le tronc sort toujours : l'ensemble diminue à chaque tour
				rest = new Set([...rest].filter(i => !onPath.has(i) && Math.min(...line.map(q => dist(pts[i], q))) > 3));
			}
		}
	}
	return { width, height, paths };
}
