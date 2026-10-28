import Bag from './../../../tools/Bag.js';
import {delay, now} from './../../../tools/helpers.js';
import {lerp} from './../../../tools/lerp.js';
import { createNoise2D } from 'simplex-noise';




// Move B 1000
export const Move_B = async (BASE, [duration=0]=[])=>{
	const origin = BASE.robot.location4D;
	const bag = new Bag();
	const t0 = now();

	const minZ =  BASE.table.toFloorLocation(origin).z + 40;
	const count = Math.round(lerp(2, 4, Math.random()));
	try{
		let t = now() - t0;
		while(t < duration){
			t = now() - t0;
			const point = origin.clone();
			const offZ = 10 * Math.sin(count * t*0.001 * Math.PI * 2 / (duration * 0.001));

			point.z += offZ;
			point.z = Math.min(BASE.robot.conf.maxZ, Math.max(minZ + BASE.memory.conf.depth, point.z));

			bag.add(BASE.robot.go(point));
			await delay(20);
			bag.check();
		}
	}finally{
		await BASE.robot.stop().catch(error=>{ bag.failure ??= error; });
	}
	bag.check();
	return await BASE.robot.go(origin);
}