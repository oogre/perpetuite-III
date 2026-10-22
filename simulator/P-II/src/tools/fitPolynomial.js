// Comment ça marche : chaque ligne donne un point d’entrée (la position mesurée PillX, PillY) et une cible (la pose du robot). Pour chaque axe, on cherche les 10 coefficients qui minimisent l’erreur quadratique sur toutes les lignes. fitPolynomial construit la matrice X des termes (une ligne par mesure), résout XᵀX · c = Xᵀ · cible par élimination de Gauss et renvoie CX, CY, l’erreur RMS, l’erreur maximale et une fonction apply(px, py).

// Résultat sur votre tableau :

// CX = [1.58799, -0.45072, -0.22589, 0.16753, 511.26891, -1.1383, 4.50878, -0.95975, -0.03555, 3.2874]
// CY = [-0.01742, 512.24257, -0.32808, 2.72721, -0.25554, 0.86411, 0.86637, -0.33725, -6.96058, 0.64279]

// Ce sont presque les coefficients que je vous avais donnés (ajustés sur les pixels des images, ligne « images » dans mes essais) ; l’écart est de l’ordre de 0,1 pour les petits termes, et l’erreur est la même (1,30 mm RMS). Les deux jeux sont équivalents.

// À savoir :

// Les termes et l’ordre doivent être les mêmes dans pointToWorldLocation : S = 500 et les 10 termes dans l’ordre 1, b, b², b³, a, ab, ab², a², a²b, a³.
// Pour refaire l’ajustement, utilisez des lignes où la position mesurée est calculée avant le polynôme, c’est-à-dire avec l’étape 1 seule (pixel → mm, translation par la pose du robot). Si vous mettez dans PillX des valeurs déjà corrigées, le polynôme corrigera deux fois.
// Avec 10 coefficients par axe, il faut au moins 10 mesures, et mieux vaut 40 à 60 réparties sur toute la table, bord compris.
// Le fichier de test que j’ai utilisé n’est pas dans votre dossier.

// fitPolynomial.js
// Ajuste un polynôme 2D d'ordre N : position mesurée (px, py) -> position du robot (rx, ry).
// rows : [[robotX, robotY, pillX, pillY], ...]
export const S = 500;

// termes a^i * b^j, avec a = px/S et b = py/S
// ordre 3 : 1, b, b², b³, a, ab, ab², a², a²b, a³
export const termIndices = (order) => {
	const t = [];
	for (let i = 0; i <= order; i++) for (let j = 0; j <= order - i; j++) t.push([i, j]);
	return t;
};
export const terms = (px, py, order) => {
	const a = px / S, b = py / S;
	return termIndices(order).map(([i, j]) => a ** i * b ** j);
};

// résout A·x = B par élimination de Gauss avec pivot (A : n×n, B : n)
const solve = (A, B) => {
	const n = B.length, M = A.map((row, i) => [...row, B[i]]);
	for (let c = 0; c < n; c++){
		let p = c;
		for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
		[M[c], M[p]] = [M[p], M[c]];
		for (let r = c + 1; r < n; r++){
			const f = M[r][c] / M[c][c];
			for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
		}
	}
	const x = new Array(n).fill(0);
	for (let r = n - 1; r >= 0; r--){
		let s = M[r][n];
		for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
		x[r] = s / M[r][r];
	}
	return x;
};

// moindres carrés : (XᵀX) c = Xᵀ y
const leastSquares = (X, y) => {
	const n = X[0].length;
	const A = Array.from({ length: n }, () => new Array(n).fill(0)), B = new Array(n).fill(0);
	for (let r = 0; r < X.length; r++)
		for (let i = 0; i < n; i++){
			B[i] += X[r][i] * y[r];
			for (let j = 0; j < n; j++) A[i][j] += X[r][i] * X[r][j];
		}
	for (let i = 0; i < n; i++) A[i][i] += 1e-9;      // stabilité numérique
	return solve(A, B);
};

export const fitPolynomial = (rows, order = 3) => {
	const X = rows.map(([, , px, py]) => terms(px, py, order));
	const CX = leastSquares(X, rows.map(r => r[0]));
	const CY = leastSquares(X, rows.map(r => r[1]));
	const apply = (px, py) => {
		const t = terms(px, py, order);
		return [t.reduce((s, v, i) => s + v * CX[i], 0), t.reduce((s, v, i) => s + v * CY[i], 0)];
	};
	const errs = rows.map(([rx, ry, px, py]) => { const [x, y] = apply(px, py); return Math.hypot(x - rx, y - ry); });
	const rms = Math.sqrt(errs.reduce((s, e) => s + e * e, 0) / errs.length);
	return { CX, CY, rms, max: Math.max(...errs), apply };
};