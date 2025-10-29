
import fs from 'fs-extra';
import _conf_ from './config.js';

const math = require("mathjs");
import Log from './Log.js';

const { 
  physical : {
    camera : {
      offset:[
      	xDriftPath, 
      	yDriftPath
      ],
    },
    probe_height:probeHeight, 
    pill_HEIGHT:pillHeight, 
    approche:{
      height:approche
    }
  },
  zProbe : { 
    save_path : probesPath 
  }
} = _conf_.HIGH_LEVEL_API_CONF;

const zProbs = fs.readJsonSync(probesPath);
const xDrifts = fs.readJsonSync(xDriftPath);
const yDrifts = fs.readJsonSync(yDriftPath);



const getPlaneNormal = (p1, p2, p3) => {
  const pq = sub(p2, p1);
  const pr = sub(p3, p1);
  const normal = [
    pq[1] * pr[2] - pq[2] * pr[1],
    pq[2] * pr[0] - pq[0] * pr[2],
    pq[0] * pr[1] - pq[1] * pr[0],
  ];
  const len = mag(normal)
  if (len == 0){
    throw new Error("Points are colinears");
  }
  return div(normal, len);
}

const sub = ([a, b, c], [x, y, z])=>{
  return [a - x, b - y, c - z];
}

const mult = ([a, b, c], n)=>{
  return [a * n, b * n, c * n];
}

const div = ([a, b, c], n)=>{
  return [a / n, b / n, c / n];
}

const dot = ([a, b, c], [x, y, z])=>{
  return [a * x + b * y + c * z];
}

const mag = ([x, y, z])=>{
  return Math.sqrt(x*x + y*y + z*z);
}

const getPlane = (x, y, z, set)=>{
  const triangle = getTriangle(x, y, z, set); 
  return {
    normal : getPlaneNormal(...triangle),
    point : triangle[0]
  }
}

const getTriangle = (x, y, z, set)=>{
  let closestPoints = set.map(([_x, _y, _z])=>{
    let dX = x - _x;
    let dY = y - _y;
    return [_x, _y, _z, Math.sqrt(dX*dX + dY*dY)];
  }).sort((a, b)=> a[3]-b[3]);
  closestPoints.length = 3;
  closestPoints.map(([_x, _y, _z])=>{return [_x, _y, _z]}); 
  return closestPoints;
}

const getIntersection=(point, set)=>{
  point = [...point, 0];
  const { normal : planeNormal, point : planePoint} = getPlane(...point, set)
  const rayVector = [0, 0, -1];
  const diff = sub(point, planePoint);
  const prod1 = dot(diff, planeNormal);
  const prod2 = dot(rayVector, planeNormal);
  const prod3 = prod1 / prod2;
  return sub(point, mult(rayVector, prod3));
}

export const getDepthFor = (point)=>{
  const [x, y, z] = getIntersection(point, zProbs);
  return [x, y, z + approche + pillHeight - probeHeight]
}

export const getOffsetFor = (point)=>{
  // Log.warn(xDrifts)

  // Log.warn("")

  //Log.warn(point);
  const [ x1, y1, xDrift ] = getIntersection(point, xDrifts);
  const [ x2, y2, yDrift ] = getIntersection(point, yDrifts);

  // Log.warn("")
  // Log.warn(x1, y1, xDrift)

  // Log.warn(x2, y2, yDrift)

  return [xDrift, yDrift]
}

const intersection = (x, y, z, triangle)=>{
  const matB = math.matrix(triangle.map(([x, y, z]) => [z]))
  const matA = math.matrix(triangle.map(([x, y]) => [x, y, 1]))
  const maAt = math.transpose(matA);
  const fit = math.chain(maAt).multiply(matA).inv().multiply(maAt).multiply(matB).done()
  const [[a, b, c]] = math.transpose(fit).valueOf();
  z = a * x + b * y + c;
  return [x, y, z]
}

export const getOffset2For = (point) => {
  point = [...point, 0];
  const xTriangle = getTriangle(...point, xDrifts);
  const [ax, ay, ox] = intersection(...point, xTriangle);
  const yTriangle = getTriangle(...point, yDrifts);
  const [bx, by, oy] = intersection(...point, yTriangle);
  return [ox, oy]
}
