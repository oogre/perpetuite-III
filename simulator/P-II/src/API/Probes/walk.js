import { Vector4 } from './../../tools/Vector.js';
import { Robot_go, Robot_grab, Robot_drop, Robot_speed, Robot_acc, Robot_dcc, Robot_gripper } from '../Robot';
import {delay} from './../../tools/helpers.js';
import {Memory_get, Memory_clear} from './../Memory';



// déplace une pillule d'un point à l'autre 

export const Probes_walk = async (BASE)=>{

	await Robot_speed(BASE, [BASE.robot.conf.default.speed]);
	await Robot_acc(BASE, [BASE.robot.conf.default.acc]);
	await Robot_dcc(BASE, [BASE.robot.conf.default.dcc]);
	await Robot_gripper(BASE, [true]);

	const points = BASE.table.pointToExplore.sort(()=>Math.random()-0.5)
	await BASE.robot.controller.WaitProbe();

	for(const pos of points){
		const location = new Vector4(pos.x, pos.y, 0, 0);
		await Robot_acc(BASE, [25]);
		await Robot_dcc(BASE, [25]);
		await Robot_go(BASE, location);
		await delay(200);
		await Robot_drop(BASE);
		if(Memory_get(BASE, []).split("\n") == 0){
			console.log("Memory problem");
			await Robot_gripper(BASE, [false]);
			return false;
		}
		const pillLocation = BASE.robot.location4D;
		console.log(BASE.robot.location2D.toString(), await Memory_get(BASE, []));
		await Robot_grab(BASE);
		await delay(200);
		await Memory_clear(BASE);
	}
	await Robot_gripper(BASE, [false]);
	return true;
}

