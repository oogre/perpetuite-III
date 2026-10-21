import { Vector4, Vector2 } from './../../tools/Vector.js';
import { Robot_go, Robot_grab, Robot_drop, Robot_speed, Robot_acc, Robot_dcc, Robot_gripper } from '../Robot';
import {delay} from './../../tools/helpers.js';
import {Memory_get, Memory_clear} from './../Memory';

export const Probes_test = async (BASE)=>{

	await Robot_speed(BASE, [BASE.robot.conf.default.speed]);
	await Robot_acc(BASE, [BASE.robot.conf.default.acc]);
	await Robot_dcc(BASE, [BASE.robot.conf.default.dcc]);
	await Robot_gripper(BASE, [true]);
	await BASE.robot.controller.WaitProbe();

	for(const pos of BASE.table.pointToExplore()){
		await Robot_go(BASE, new Vector4(pos.x, pos.y, 0, 0));
		await Robot_drop(BASE);
		await delay(1000);
		console.log(BASE.robot.location2D, await Memory_get(BASE, []));
		await Robot_grab(BASE);
		await delay(1000);
		await Memory_clear(BASE);
		await Robot_gripper(BASE, [true]);
		await BASE.robot.controller.WaitProbe();
	}
	return true;
}

