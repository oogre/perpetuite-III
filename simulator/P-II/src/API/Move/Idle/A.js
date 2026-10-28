
import {delay} from './../../../tools/helpers.js';
import {Robot_travelPath} from './../../Robot';
import {lerp} from "./../../../tools/math.js";
import { createNoise2D } from 'simplex-noise';

const now = () => Number(process.hrtime.bigint()) / 1e6;
class Bag{
	#set = new Set();
	failure = null;                                  // première vraie erreur
	add(promise){
		const tracked = promise
			.catch(error=>{
				if(error?.message !== "Move interrupted by a new target") this.failure ??= error;
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
	const noise2D = createNoise2D();
	let id = 0;
	let inc = 0.1;
	const bag = new Bag();
	const t0 = now();
	while(now() - t0 < duration){
		id+=inc;
		const point = origin.clone();
		point.w = lerp(-40, 40, noise2D(0,  id)*0.5 + 0.5);
		bag.add(BASE.robot.go(point));
		await delay(100);
		bag.check();
	}
	await BASE.robot.stop();

	return await BASE.robot.go(origin);
}