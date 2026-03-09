import {Robot_explore} from './../Robot';
import {Exec_loop} from './loop.js';
import {Real_save} from './../Real/save.js';

import Chronos from "./../../tools/Chronos.js"

let frameChronos = 0;

export const Exec_start = async (BASE)=>{
	BASE.hasToLoop = true;
	const startedAt = new Date();
	console.log(`Start at : ${startedAt.getHours().toString().padStart(2, '0')}:${startedAt.getMinutes().toString().padStart(2, '0')}`)

	BASE.frameChronos = new Chronos();
	
	try{
		await Exec_loop(BASE);	
	}catch(error){
		console.log(error);
	}
	const stopedAt = new Date();
	console.log(`Stoped at : ${stopedAt.getHours().toString().padStart(2, '0')}:${stopedAt.getMinutes().toString().padStart(2, '0')}`)
	const runDuration = stopedAt - startedAt;
	console.log(`Last run duration : ${Math.floor(runDuration/1000)} s.`)
	Real_save(BASE);
}