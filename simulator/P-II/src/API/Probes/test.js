import { Vector4, Vector2 } from './../../tools/Vector.js';
import { Robot_go, Robot_grab, Robot_drop, Robot_speed, Robot_acc, Robot_dcc, Robot_gripper } from '../Robot';
import {delay} from './../../tools/helpers.js';
import {Memory_get} from './../Memory';

export const Probes_test = async (BASE)=>{

	await Robot_speed(BASE, [BASE.robot.conf.default.speed]);
	await Robot_acc(BASE, [BASE.robot.conf.default.acc]);
	await Robot_dcc(BASE, [BASE.robot.conf.default.dcc]);
	await Robot_gripper(BASE, [true]);
	await BASE.robot.controller.WaitProbe();

	const list = new Array(10).fill(0).map((_, id)=> new Vector2((id * 110) - 550  , 0));
	for(const pos of list){
		await Robot_go(BASE, new Vector4(...pos, 0, 0));
		await Robot_drop(BASE);
		console.log(pos, await Memory_get(BASE, []));
		await delay(1000);
		if(!await Robot_grab(BASE)){
			await BASE.robot.controller.WaitProbe();
		}
	}
	return true;
}

