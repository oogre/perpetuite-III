
import { Robot_go } from "./../Robot";
import { Vector3 } from './../../tools/Vector3.js';
import { lerp } from "./../../tools/math.js";


export const Move_cross = async ({robot})=>{
	const origin = robot._location.clone()
	


	 let p0 = Vector.Right().rotate(Vector.Up(), Math.random()*2*Math.PI).multiply(limitters.radius.value);
  p0.z = getDepthForXY(p0.x, p0.y) + 10;
  let p1 = p0.clone().rotate(Vector.Up(), Math.PI);
  p1.z = getDepthForXY(p1.x, p1.y) + 10;
  let p2 = p1.clone().rotate(Vector.Up(), Math.PI*0.5);
  p2.z = getDepthForXY(p2.x, p2.y) + 10;
  let p3 = p2.clone().rotate(Vector.Up(), Math.PI);
  p3.z = getDepthForXY(p3.x, p3.y) + 10;
  return [p0, p1, p2, p3]



	await Robot_go({robot}, origin);
	return true;
}