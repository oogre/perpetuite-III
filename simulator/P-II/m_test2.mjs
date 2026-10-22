import { Vector2 } from 'three';
const z=4.222, off=[23,303], W=1000,H=1000, R=new Vector2(100,-200);
const p=new Vector2(523,803).sub(new Vector2(W/2+off[0],H/2+off[1])).divideScalar(z).add(R);
const [x,y]=p; console.log(x,y);
const q=new Vector2(623,903).sub(new Vector2(W/2+off[0],H/2+off[1])).divideScalar(z).add(R); console.log(q.x.toFixed(2),q.y.toFixed(2));
