import { Vector4 } from './../../tools/Vector.js';
import {Robot_go} from '../Robot/go.js';
import {Robot_gripper} from '../Robot/go.js';
import {Camera_capture} from './../Camera';

export const Probes_xy = async ({robot})=>{
	const location = new Vector4(...BASE.grid.getRandomCellLocation(), -300, 0);
	await BASE.robot.setSeed(BASE.robot.conf.default.speed);
	await BASE.robot.setAcceleration(BASE.robot.conf.default.acc);
	await BASE.robot.setDeceleration(BASE.robot.conf.default.dcc);
	await Robot_go(BASE, new Vector4(location.x, location.y, 0, 0));
	await Robot_gripper(BASE, [1]);
	await BASE.robot.controller.WaitProbe();
	await Robot_go(BASE, new Vector4(location.x, location.y, location.y+10, 0));
	await BASE.robot.setSeed(10);
	await BASE.robot.setAcceleration(10);
	await BASE.robot.setDeceleration(10);
	await Robot_go(BASE, location);
	await Robot_gripper(BASE, [0]);
	await Robot_go(BASE, new Vector4(location.x, location.y, location.y+10, 0));
	await BASE.robot.setSeed(BASE.robot.conf.default.speed);
	await BASE.robot.setAcceleration(BASE.robot.conf.default.acc);
	await BASE.robot.setDeceleration(BASE.robot.conf.default.dcc);
	await Robot_go(BASE, new Vector4(location.x, location.y, 0, 0));
	return await Camera_capture(BASE);
}

