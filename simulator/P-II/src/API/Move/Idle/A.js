import Bag from './../../../tools/Bag.js';
import {delay, now} from './../../../tools/helpers.js';
import { createNoise2D } from 'simplex-noise';

const noise2D = createNoise2D();
const yInc = 0.05;
let   yOff = 0;



// Move A 1000
export const Move_A = async (BASE, [duration=0]=[])=>{
	const origin = BASE.robot.location4D;
	const bag = new Bag();
	const t0 = now();
	try{
		while(now() - t0 < duration){
			yOff+=yInc;
			const point = origin.clone();
			point.w += 10 * noise2D(0, yOff);
			point.w = Math.min(40, Math.max(-40,point.w));
			bag.add(BASE.robot.go(point));
			await delay(100);
			bag.check();
		}
	}finally{
		await BASE.robot.stop().catch(error=>{ bag.failure ??= error; });
	}
	bag.check();
	return await BASE.robot.go(origin);
}