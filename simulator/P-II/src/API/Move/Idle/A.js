
import {delay} from './../../../tools/helpers.js';
import {Robot_travelPath} from './../../Robot';
import {lerp} from "./../../../tools/math.js";
import { createNoise2D } from 'simplex-noise';

const now = () => Number(process.hrtime.bigint()) / 1e6;

class Bag{
	#set = new Set();
	results = [];
	add(promise){
		const tracked = promise.then(
			value => this.results.push({status:"fulfilled", value}),
			reason => this.results.push({status:"rejected", reason})
		).finally(()=>this.#set.delete(tracked));
		this.#set.add(tracked);
		return promise;
	}
	async settled(){
		while(this.#set.size) await Promise.all([...this.#set]);
		return this.results;                     // aucun rejet : on a déjà converti chaque promesse
	}
}

// export const Robot_travelPath = async (BASE, path=[])=>{


// 	const bag = new Bag();
// 	const t0 = now();
// 	while(now() - t0 < ){

// 	}

// 	bag.add(Robot_go(...));
// 	// plus tard, depuis un autre endroit :
// 	bag.add(Robot_go(...));
// 	const results = await bag.settled();   

// 	const results = await Promise.allSettled(
// 		path.map( point => {
// 			return Robot_go(BASE, new Vector4(...point), {enableDamping:false, curve:false});
// 		})
// 	);
// 	// chaque go() interrompt le précédent par "Move interrupted…" : c'est normal, on l'ignore
// 	const failure = results.find(r =>
// 		r.status === "rejected" && r.reason?.message !== "Move interrupted by a new target"
// 	);
// 	if(failure) throw failure.reason;

// 	return true;
// }


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
		bag.add(Robot_go(BASE, point, {enableDamping:false, curve:false}));
		await delay(100);
	}
	await BASE.robot.stop();



	// const results = await Promise.allSettled(
	// 	path.map( point => {
	// 		return Robot_go(BASE, new Vector4(...point), {enableDamping:false, curve:false});
	// 	})
	// );
	// // chaque go() interrompt le précédent par "Move interrupted…" : c'est normal, on l'ignore
	// const failure = results.find(r =>
	// 	r.status === "rejected" && r.reason?.message !== "Move interrupted by a new target"
	// );
	// if(failure) throw failure.reason;

	return await BASE.robot.go(origin);
}