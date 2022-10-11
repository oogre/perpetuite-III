#!/usr/bin/env node

import {getArc} from './../common/Path.js';
import Vector from './../common/Vector.js';
import {limitters } from './../common/moveLimit.js';

import {lerp3, lerp} from './../common/tools.js';

const wait = async (t) => new Promise(r => setTimeout(()=>r(), t));

let old = undefined;
const main = async () => {
	const p1 = new Vector(...(Vector.Random2D().multiply(limitters.radius.value * Math.random()).toArray(2)), lerp(limitters.depth.min, limitters.depth.max, Math.random())); 
 	const pts = getArc(old, p1);
 	old = p1;

 	for(const pt of pts){
 		console.log(pt.join(" "));
 		await wait(100);
 	}
	
	return main();
}

main();