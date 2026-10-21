// Correction continue (polynôme d'ordre 3) de la position mesurée par la caméra (mm).
// Ajustée par moindres carrés sur 122 points (séries 2 et 4, disque de rayon ~570 mm).
//   x' = sum(CX[k] * m[k]),  y' = sum(CY[k] * m[k])
//   m = [1, y, x, y^2, x*y, x^2, y^3, x*y^2, x^2*y, x^3]   (x, y en mm, mesurés)
// Résidu : 1.02 mm RMS / 2.6 mm max (9.6 mm RMS avant correction).
// Validation croisée entre séries : 1.14 et 1.25 mm (affine : 1.54 mm).
// Valable dans le disque r <= ~600 mm ; au-delà le polynôme extrapole, ne pas s'y fier.
export const CAMERA_CORRECTION = {
  CX: [
    -1.9586074467651526,
    -0.00021062720356934057,
    0.979331498912172,
    -6.932383331558457e-07,
    2.4491316075956907e-06,
    4.4968989081741297e-07,
    1.9682051394817726e-09,
    -1.6643790704213064e-08,
    1.6647364178429672e-10,
    -5.73307813153754e-09,
  ],
  CY: [
    0.195808678084596,
    1.021937200233724,
    0.00026472105029262595,
    -2.3144948582721947e-06,
    4.016122330619239e-06,
    -4.705208603397103e-07,
    5.291587722979668e-09,
    3.726986642293866e-09,
    -4.206292511291398e-08,
    9.141706651152546e-10,
  ],
};

const monomials = (x, y) => [1, y, x, y * y, x * y, x * x, y ** 3, x * y * y, x * x * y, x ** 3];

/** mesure caméra -> position réelle */
export function correctMeasure([x, y], k = CAMERA_CORRECTION) {
  const m = monomials(x, y);
  let ox = 0, oy = 0;
  for (let i = 0; i < m.length; i++) { ox += k.CX[i] * m[i]; oy += k.CY[i] * m[i]; }
  return [ox, oy];
}

/** position voulue -> position qui serait mesurée (inverse par Newton, convergence < 1e-9 mm) */
export function inverseCorrection([tx, ty], k = CAMERA_CORRECTION) {
  let x = tx, y = ty;
  for (let it = 0; it < 20; it++) {
    const [fx, fy] = correctMeasure([x, y], k);
    const ex = fx - tx, ey = fy - ty;
    if (Math.hypot(ex, ey) < 1e-9) break;
    const h = 1e-3;
    const [ax, ay] = correctMeasure([x + h, y], k);
    const [bx, by] = correctMeasure([x, y + h], k);
    const a = (ax - fx) / h, c = (ay - fy) / h, b = (bx - fx) / h, d = (by - fy) / h;
    const det = a * d - b * c;
    x -= (d * ex - b * ey) / det;
    y -= (-c * ex + a * ey) / det;
  }
  return [x, y];
}
