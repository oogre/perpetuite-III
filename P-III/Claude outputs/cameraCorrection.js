// Correction affine continue de la position mesurée par la caméra (mm).
// Ajustée par moindres carrés sur 61 points (2e série de mesures) (disque de rayon ~570 mm) :
//   x' = A*x + B*y + TX
//   y' = C*x + D*y + TY
// Résidu : 1.44 mm RMS / 4.1 mm max (9.6 mm RMS avant correction).
// Ordre 2 : aucun gain ; ordre 3 (20 coefs) : 1.27 mm en validation croisée
// contre 1.53 mm pour l'affine, gain jugé trop faible pour le risque de sur-ajustement.
export const CAMERA_CORRECTION = {
  A: 0.9773001118352537, B: 0.0006402736712113581, TX: -2.165312497986483,
  C: 0.0008571770077407507, D: 1.0200265282014376, TY: -0.020273716148446995,
};

/** mesure caméra -> position réelle */
export function correctMeasure([x, y], k = CAMERA_CORRECTION) {
  return [k.A * x + k.B * y + k.TX, k.C * x + k.D * y + k.TY];
}

/** position voulue -> position à mesurer/commander (inverse exact) */
export function inverseCorrection([x, y], k = CAMERA_CORRECTION) {
  const det = k.A * k.D - k.B * k.C;
  const dx = x - k.TX, dy = y - k.TY;
  return [(k.D * dx - k.B * dy) / det, (-k.C * dx + k.A * dy) / det];
}
