import { Vector4, Vector2 } from './../../tools/Vector.js';
import { Robot_go, Robot_catch, Robot_grab, Robot_drop, Robot_speed, Robot_acc, Robot_dcc, Robot_gripper } from '../Robot';
import {delay} from './../../tools/helpers.js';
import {Memory_get, Memory_clear} from './../Memory';

export const Probes_test = async (BASE)=>{

	await Robot_speed(BASE, [BASE.robot.conf.default.speed]);
	await Robot_acc(BASE, [BASE.robot.conf.default.acc]);
	await Robot_dcc(BASE, [BASE.robot.conf.default.dcc]);
	await Robot_gripper(BASE, [true]);
	await BASE.robot.controller.WaitProbe();
	const points = [...BASE.table.pointToExplore, ...BASE.table.pointToExplore, ...BASE.table.pointToExplore, ...BASE.table.pointToExplore, ...BASE.table.pointToExplore].sort(()=>Math.random()-0.5)
	for(const pos of points){
		await Robot_acc(BASE, [25]);
		await Robot_dcc(BASE, [25]);
		await Robot_go(BASE, new Vector4(pos.x, pos.y, 0, 0));
		await delay(4000);
		await Robot_drop(BASE);
		console.log(BASE.robot.location2D, await Memory_get(BASE, []));
		if(Memory_get(BASE, []).split("\n") == 0){
			return false;
		}
		await Robot_grab(BASE);
		await Memory_clear(BASE);
		await Robot_gripper(BASE, [true]);
	}
	return true;
}

