import _conf_ from "./config.js";
import LOG from "./Log.js";
import {getDepthForXY, limitters} from './../common/moveLimit.js';
import Vector from './../common/Vector.js';
import {lerp} from './../common/tools.js';


export const getArc = (start, stop) => {

  const findCircle = ( {x:x1, y:y1}, {x:x2, y:y2}, {x:x3, y:y3} ) => {
    const x12 = x1 - x2;
    const x13 = x1 - x3;
 
    const y12 = y1 - y2;
    const y13 = y1 - y3;
 
    const y31 = y3 - y1;
    const y21 = y2 - y1;
 
    const x31 = x3 - x1;
    const x21 = x2 - x1;
 
    // x1^2 - x3^2
    const sx13 = (x1*x1 - x3*x3);
    // y1^2 - y3^2
    const sy13 = (y1*y1 - y3*y3);
 
    const sx21 = (x2*x2 - x1*x1);
                     
    const sy21 = (y2*y2 - y1*y1);
 
    const f = ((sx13) * (x12)
            + (sy13) * (x12)
            + (sx21) * (x13)
            + (sy21) * (x13))
            / (2 * ((y31) * (x12) - (y21) * (x13)));
    const g = ((sx13) * (y12)
            + (sy13) * (y12)
            + (sx21) * (y13)
            + (sy21) * (y13))
            / (2 * ((x31) * (y12) - (x21) * (y13)));
 
    const c = - x1 * x1 - y1 * y1 - 2 * g * x1 - 2 * f * y1;
 
    // eqn of circle be x^2 + y^2 + 2*g*x + 2*f*y + c = 0
    // where centre is (h = -g, k = -f) and radius r
    // as r^2 = h^2 + k^2 - c
    const h = -g;
    const k = -f;
    const sqr_of_r = h * h + k * k - c;
 
    // r is the radius
    const r = Math.sqrt(sqr_of_r);
    return [new Vector(h, k), r]
  }

  const startDepth = start.z;
  const stopDepth = stop.z;
  start = new Vector(...start.toArray(2));
  stop = new Vector(...stop.toArray(2));

  const [center, r] = findCircle(start, stop, Vector.Random2D().multiply(limitters.radius.value * Math.random()));


  const aStart = start.subtract(center).angleTo(Vector.Right());
  const aStop = stop.subtract(center).angleTo(Vector.Right());

  const pts = (new Array(11)).fill(0).map((_, k)=> [
    center.x + r * Math.cos(lerp(aStart, aStop, k*0.1)), 
    center.y + r * Math.sin(lerp(aStart, aStop, k*0.1)),
    lerp(startDepth, stopDepth, k*0.1)
  ])

  return [start, stop, pts];
}