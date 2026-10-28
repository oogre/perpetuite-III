
import {delay} from './../../../tools/helpers.js';
import {Robot_travelPath} from './../../Robot';
import {lerp} from "./../../../tools/math.js";
import { createNoise2D } from 'simplex-noise';

const noise2D = createNoise2D();
const yInc = 0.01;
let   yOff = 0;
const now = () => Number(process.hrtime.bigint()) / 1e6;

class Bag{
	#set = new Set();
	failure = null;                                  // première vraie erreur
	constructor(t0 = now()){ this.t0 = t0; }
	add(promise){
		const tracked = promise
			.catch(error=>{
				if(error?.message !== "Move interrupted by a new target"){
					console.log(`[Bag] +${Math.round(now() - this.t0)} ms :`, error.message);
					this.failure ??= error;
				}
			})
			.finally(()=>this.#set.delete(tracked));
		this.#set.add(tracked);
	}
	check(){ 
		if(this.failure) throw this.failure; 
	}  // relance l'erreur ACE telle quelle (code '604')
}


// Move A 1000
export const Move_A = async (BASE, [duration=0]=[])=>{
	const origin = BASE.robot.location4D;
	
	const bag = new Bag();
	const t0 = now();
	try{
		while(now() - t0 < duration){
			yOff+=yInc;
			const point = origin.clone();
			point.w += 5 * noise2D(0, yOff);
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