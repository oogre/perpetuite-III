import {Exec_loop} from './loop.js';
import {Real_save} from './../Real/save.js';
import ColorCli from "cli-color";

import {Robot_HighPower} from '../Robot/HighPower.js';

import Chronos from "./../../tools/Chronos.js"

let frameChronos = 0;

export const Exec_start = async (BASE)=>{
	BASE.hasToLoop = true;
	const startedAt = new Date();
	console.log(`Start at : ${startedAt.getHours().toString().padStart(2, '0')}:${startedAt.getMinutes().toString().padStart(2, '0')}`);
	BASE.frameChronos = new Chronos();
	await Robot_HighPower(BASE, [true]);
	try{
		await Exec_loop(BASE);	
	}catch(error){
		if(error.code){
			console.log(ColorCli.red(error.code));
		}else if(error.message){
			console.log(ColorCli.red(error.message));
		}else{
			console.log(error);	
		}
	}
	await Robot_HighPower(BASE, [false]);
	const stopedAt = new Date();
	console.log(`Stoped at : ${stopedAt.getHours().toString().padStart(2, '0')}:${stopedAt.getMinutes().toString().padStart(2, '0')}`);
	const runDuration = stopedAt - startedAt;
	console.log(`Last run duration : ${Math.floor(runDuration/1000)} s.`);
	Real_save(BASE);
}