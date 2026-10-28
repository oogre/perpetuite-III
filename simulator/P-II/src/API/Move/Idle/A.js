
import {Robot_go} from "./../../Robot";
import {lerp} from "./../../../tools/math.js";
import { createNoise2D } from 'simplex-noise';


// horloge monotone : insensible aux changements d'heure du système, contrairement à Date.now()
const now = () => Number(process.hrtime.bigint()) / 1e6;



// Move doupt
export const Move_A = async (BASE, [duration=0]=[])=>{
	let t0 = now();
	const origin = BASE.robot.location4D;
	const work = origin.clone()
	const noise2D = createNoise2D();
	let y = 0;
	let inc = 0.01;
	while(now() - t0 < duration){
		work.w = lerp(-40, 40, noise2D(0,  y)*0.5 + 0.5);
		y += inc;
		await Robot_go(BASE, work, {enableDamping:false, curve:false});
	}

	return Robot_go(BASE, origin, {enableDamping:false, curve:false})
}
