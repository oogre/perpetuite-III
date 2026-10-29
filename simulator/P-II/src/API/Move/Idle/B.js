import Bag from './../../../tools/Bag.js';
import {delay, now} from './../../../tools/helpers.js';
import {lerp} from './../../../tools/math.js';
import { createNoise2D } from 'simplex-noise';


// tools/zSine.js
const zSine = ({z0, amplitude = 20, period = 2000, min = -300, max = 0, rising = true})=>{
	const A = amplitude;
	if(max - min < 2 * A) throw new Error("zSine : course trop courte pour l'amplitude");
	if(z0 < min || z0 > max) throw new Error(`zSine : z0 (${z0}) hors course [${min}, ${max}]`);
	const c = Math.min(max - A, Math.max(min + A, z0));       // centre : z0, ou décalé si on touche une limite
	const s = Math.asin((z0 - c) / A);
	const phi = rising ? s : Math.PI - s;                     // départ vers le haut (z croît) ou vers le bas
	const w = 2 * Math.PI / period;
	const f = (t)=>c + A * Math.sin(phi + w * t);
	f.center = c;
	return f;
};

// Move B 1000
export const Move_B = async (BASE, [duration=0]=[])=>{
	const origin = BASE.robot.location4D;
	const bag = new Bag();
	const t0 = now();
	const amplitude = 10;
	const hi = BASE.robot.conf.maxZ;
	const lo = BASE.table.toFloorLocation(origin).z + BASE.memory.conf.depth
	if(hi - lo < 2 * amplitude) return await delay(duration);        // pas de place pour l'animation

	const anim = zSine({
		z0 : Math.min(hi, Math.max(lo, origin.z)), 
		amplitude : amplitude, 
		period : 2000, 
		max:BASE.robot.conf.maxZ,
		min:BASE.table.toFloorLocation(origin).z + BASE.memory.conf.depth
	});
	try{
		let t = now() - t0;
		while(t < duration){
			t = now() - t0;
			const point = origin.clone();
			point.z = anim(t);
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