import { Vector4 } from './../../tools/Vector.js';
import { Robot_go, Robot_grab, Robot_drop, Robot_speed, Robot_acc, Robot_dcc, Robot_gripper } from '../Robot';
import {Robot_speed} from './speed.js';
import {Robot_acc} from './acc.js';
import {Robot_dcc} from './dcc.js';


export const Probes_test = async (BASE)=>{

	await Robot_speed(BASE, BASE.robot.conf.default.speed);
	await Robot_acc(BASE, BASE.robot.conf.default.acc);
	await Robot_dcc(BASE, BASE.robot.conf.default.dcc);
	await Robot_gripper(BASE, [true]);
	await BASE.robot.controller.WaitProbe();

	const list = new Array(10).fill(0);
	for(const id of list){
		await Robot_go(BASE, new Vector4(...BASE.grid.getRandomCellLocation(), 0, 0));
		await Robot_drop(BASE);
		await Robot_grab(BASE);
	}
	return true;
}

