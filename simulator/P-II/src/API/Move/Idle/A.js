
import {delay} from './../../../tools/helpers.js';
import {Robot_travelPath} from './../../Robot';
import {lerp} from "./../../../tools/math.js";
import { createNoise2D } from 'simplex-noise';

// Move A 1000
export const Move_A = async (BASE, [duration=0]=[])=>{
	let t0 = now();
	const origin = BASE.robot.location4D;
	const noise2D = createNoise2D();
	let inc = 0.1;


	await Promise.race([
		Robot_travelPath(BASE, [
		...(new Array(50).map((_, id)=>{
				const point = origin.clone();
				point.w = lerp(-40, 40, noise2D(0,  id*inc)*0.5 + 0.5);
				return point;
			})
		)
		]), 
		delay(duration)
	]);

	await BASE.robot.stop();

	return await BASE.robot.go(origin);
}
