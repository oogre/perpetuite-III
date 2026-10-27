import { Vector2, Vector3 } from './Vector.js';

import {isLocation} from "./validators.js";

export const TAU = 2 * Math.PI;

export const inverseLerp = (a, b, v) => {
  if(a == b)return 0;
  return (v - a) / (b - a);
}

export const degToRag = 1/360 * TAU

export const shortAngle = (from, to, MAX=TAU)=>{
  var difference = to - from % MAX
  return ((2 * difference) % MAX) - difference
}

export const lerpAngle = (from, to, weight)=>{
  return from + short_angle(from, to) * weight
}

export const lerp = (from, to, weight, limitter=false)=>{
    let value = from * (1 - weight) + to * weight;
    if(limitter){
      value = Math.min(Math.max(value, Math.min(from, to)), Math.max(from, to));
    }
    return value;
}


const _u = new Vector3();
const _v = new Vector3();

// distance du point `p` à la droite qui passe par `a` et `b` (a et b distincts)
export const distanceToLine = (p, a, b) => {
  _u.subVectors(b, a);
  const length = _u.length();
  _v.subVectors(p, a);
  return _u.cross(_v).length() / length;       // |AB × AP| / |AB| : l'aire du parallélogramme divisée par sa base
};

export const areAligned = (a, b, c, tolerance = 1) => {
  const ab = a.distanceToSquared(b), ac = a.distanceToSquared(c), bc = b.distanceToSquared(c);
  const longest = Math.max(ab, ac, bc);
  if (longest === 0) return true;                                      // trois points confondus
  if (longest === ab) return distanceToLine(c, a, b) <= tolerance;     // droite = les deux plus éloignés, le troisième est testé contre elle
  if (longest === ac) return distanceToLine(b, a, c) <= tolerance;
  return distanceToLine(a, b, c) <= tolerance;
};
