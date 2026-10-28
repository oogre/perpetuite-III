import {Exec_loop} from './loop.js';
import {Real_save} from './../Real/save.js';
import ColorCli from "cli-color";

import {Robot_HighPower, Robot_gripper, Robot_explore, Robot_go} from '../Robot';
import {Memory_load, Memory_save} from '../Memory';
import Chronos from "./../../tools/Chronos.js"
import { Vector4 } from './../../tools/Vector.js';

let frameChronos = 0;

export const Exec_start = async (BASE)=>{
	BASE.hasToLoop = true;
	const startedAt = new Date();
	console.log(`Start at : ${startedAt.getHours().toString().padStart(2, '0')}:${startedAt.getMinutes().toString().padStart(2, '0')}`);
	BASE.frameChronos = new Chronos();
	
	Memory_load(BASE);
	await Robot_gripper(BASE, [false]);
	await Robot_HighPower(BASE, [true]);
	await Robot_go(BASE, new Vector4(0, 0, 0, 0), {enableDamping:true, curve:true})
	await Robot_explore(BASE);

	await Exec_loop(BASE);
	
	await Memory_save(BASE);
	await Robot_gripper(BASE, [false]);
	await Robot_HighPower(BASE, [false]);

	const stopedAt = new Date();
	console.log(`Stoped at : ${stopedAt.getHours().toString().padStart(2, '0')}:${stopedAt.getMinutes().toString().padStart(2, '0')}`);
	const runDuration = stopedAt - startedAt;
	console.log(`Last run duration : ${Math.floor(runDuration/1000)} s.`);
	if(BASE.robot.conf.simulation){
		Real_save(BASE);
	}
	//process.exit(0);
}