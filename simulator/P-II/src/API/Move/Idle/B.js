import Bag from './../../../tools/Bag.js';
import {delay, now} from './../../../tools/helpers.js';
import { createNoise2D } from 'simplex-noise';

const noise2D = createNoise2D();
const yInc = 0.05;
let   yOff = 0;



// Move B 1000
export const Move_B = async (BASE, [duration=0]=[])=>{
	const origin = BASE.robot.location4D;
	const bag = new Bag();
	const t0 = now();

	const minZ =  BASE.table.toFloorLocation(origin).z + 40;

	try{
		let t = now() - t0;
		while(t < duration){
			t = now() - t0;
			yOff+=yInc;
			const point = origin.clone();

			point.z -= 20 * (1 - (Math.cos(t*0.001 * Math.PI * 2 / (duration * 0.001)) * 0.5 + 0.5));
			point.z = Math.min(0, Math.max(minZ, point.z));

			bag.add(BASE.robot.go(point));
			await delay(50);
			bag.check();
		}
	}finally{
		await BASE.robot.stop().catch(error=>{ bag.failure ??= error; });
	}
	bag.check();
	return await BASE.robot.go(origin);
}