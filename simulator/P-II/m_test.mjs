import { Matrix3, Vector2 } from 'three';
const z=5, un=500+z*-4.46, vn=500+z*61.79, rx=100.17234, ry=-200.15440, DX=0.0228, DY=0.0199;
const m=new Matrix3()
 .multiply(new Matrix3().makeTranslation(rx*(1+DX), ry*(1+DY)))
 .multiply(new Matrix3().makeScale(-1/z, 1/z))
 .multiply(new Matrix3().makeTranslation(-un, -vn));
const p=new Vector2(495.5,831).applyMatrix3(m); console.log(p.x.toFixed(2),p.y.toFixed(2));
