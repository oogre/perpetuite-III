import { Vector4 } from './../../tools/Vector.js';
import {Robot_limitter, Robot_go, Robot_gripper} from '../Robot';
import {Camera_capture} from './../Camera';
import {delay} from './../../tools/helpers.js';

export const Probes_xy = async (BASE, destination)=>{
	const location = Robot_limitter(BASE, new Vector4(...destination, -300, 0));
	console.log(location);
	await BASE.robot.setSeed(BASE.robot.conf.default.speed);
	await BASE.robot.setAcceleration(BASE.robot.conf.default.acc);
	await BASE.robot.setDeceleration(BASE.robot.conf.default.dcc);
	await Robot_go(BASE, new Vector4(location.x, location.y, 0, 0));
	await Robot_gripper(BASE, [1]);
	await BASE.robot.controller.WaitProbe();
	await Robot_go(BASE, new Vector4(location.x, location.y, location.z, 0));
	await BASE.robot.setDeceleration(100);
	await Robot_go(BASE, location);
	await Robot_gripper(BASE, [0]);
	await BASE.robot.setAcceleration(100);
	await BASE.robot.setDeceleration(BASE.robot.conf.default.acc);
	await Robot_go(BASE, new Vector4(location.x, location.y, location.z+5, 0));
	await BASE.robot.setAcceleration(BASE.robot.conf.default.acc);
	await Robot_go(BASE, new Vector4(location.x, location.y, 0, 0));
	const pillList = await Camera_capture(BASE);
	return pillList.set.toArray().map(item=>item.location);
}

