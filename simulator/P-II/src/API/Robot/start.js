import {Robot_explore} from './explore.js';
import {Robot_loop} from './loop.js';

import Chronos from "./../../tools/Chronos.js"


let hasToLoop = false;
let frameChronos = 0;

export const Robot_start = async (BASE)=>{
	BASE.hasToLoop = true;
	const startedAt = new Date();
	console.log(`Start at : ${startedAt.getHours().toString().padStart(2, '0')}:${startedAt.getMinutes().toString().padStart(2, '0')}`)
	
	await Robot_explore(BASE);

	BASE.frameChronos = new Chronos();
	
	try{
		await Robot_loop(BASE);	
	}catch(error){
		console.log(error);
	}
	const stopedAt = new Date();
	console.log(`Stoped at : ${stopedAt.getHours().toString().padStart(2, '0')}:${stopedAt.getMinutes().toString().padStart(2, '0')}`)
	const runDuration = stopedAt - startedAt;
	console.log(`Last run duration : ${Math.floor(runDuration/1000)} s.`)
}