import { Vector3 } from './Vector3.js';

import {isLocation} from "./validators.js";

export const TAU = 2 * Math.PI;

export const inverseLerp = (a, b, v) => {
  if(a == b)return 0;
  return (v - a) / (b - a);
}

export const shortAngle = (from, to)=>{
  var difference = to - from % TAU
  return ((2 * difference) % TAU) - difference
}

export const lerpAngle = (from, to, weight)=>{
  return from + short_angle(from, to) * weight
}

export const lerp = (from, to, weight)=>{
     return from * (1 - weight) + to * weight;
}

export const getRandomLocationOnCircle = (radius)=>{
    let alpha = TAU * Math.random();
    let r = Math.pow(Math.random(), 0.5) * radius;
    let x = r * Math.sin(alpha);
    let y = r * Math.cos(alpha);
    return new Vector3(x, y, 0);
}

export const halfCircleFromPoints=(start, stop, direction)=>{
  const lineMove = Vector3.sub(start, stop);
    const radius = lineMove.length()/2;
    const alphaStart = lineMove.hAngle();
    const alphaStop = alphaStart + direction * Math.PI;
    return arc(start, radius, alphaStart, alphaStop);
}

export const arc = (location, radius, alphaStart=0, alphaStop=TAU)=>{
  if(!isLocation(location)){
    throw new Error("arc should receive a Vector3 or an array as location");  
  }
  if(radius == 0){
    throw new Error("arc should receive a radius greater than zero");  
  }
  const [ox, oy] = [
    location.x - radius * Math.cos(alphaStart), 
    location.y - radius * Math.sin(alphaStart)
  ];
  const angle = shortAngle(alphaStart, alphaStop);
  const nPoints = Math.abs(radius * angle / TAU);
  const stepAngle = angle / nPoints;
  return new Array(Math.floor(nPoints)).fill(0).map((_, i)=>{
    const x = ox + radius * Math.cos(alphaStart + stepAngle * i);
    const y = oy + radius * Math.sin(alphaStart + stepAngle * i);
    return [x, y, location.z];
  });
}