import {Robot_explore} from './explore.js';
import {Robot_loop} from './loop.js';

import Chronos from "./../../tools/Chronos.js"


let hasToLoop = false;
let frameChronos = 0;

export const Robot_start = async (BASE)=>{
	BASE.hasToLoop = true;
	const startedAt = new Date();
	console.log(`Start at : ${startedAt.getHours()}:${startedAt.getMinutes()}`)
	
	//await Robot_explore(BASE);

	BASE.frameChronos = new Chronos();
	
	try{
		await Robot_loop(BASE);	
	}catch(error){
		console.log(error);
	}
	const stopedAt = new Date();
	console.log(`Stoped at : ${stopedAt.getHours()}:${stopedAt.getMinutes()}`)
}