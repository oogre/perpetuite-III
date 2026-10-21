import {Robot_go} from './go.js';
import {Robot_speed} from './speed.js';
import {Robot_acc} from './acc.js';
import {Robot_dcc} from './dcc.js';
import {Robot_gripper} from './gripper.js';
import {Robot_limitter} from './limitter.js';
import {Memory_get} from './../Memory';
import { Vector4 } from './../../tools/Vector.js';

export const Robot_catch = async (BASE)=>{
	BASE.robot.actionDesc = `Robot Catch`;
	if(BASE.robot.conf.simulation){
		const realPill = Memory_get({memory:BASE.real}, BASE.robot.location2D);
		await BASE.real.delete(realPill);
		BASE.robot.grabbedPill = realPill;
	}else{
		await Robot_go(BASE, new Vector4(...BASE.robot.location2D, 0, 0));
		const baseLocation = BASE.robot.location4D;
		const pillLocation = Robot_limitter(BASE, new Vector4(baseLocation.x, baseLocation.y, -300, baseLocation.w));
		const overPillLocation = new Vector4(pillLocation.x, pillLocation.y, pillLocation.z+10, pillLocation.w);
		await Robot_speed(BASE, [BASE.robot.conf.default.speed]);
		await Robot_acc(BASE, [BASE.robot.conf.default.acc]);
		await Robot_dcc(BASE, [BASE.robot.conf.default.dcc]);
		await Robot_go(BASE, pillLocation);
		await Robot_gripper(BASE, [true]);
		await Robot_speed(BASE, [1]);
		await Robot_acc(BASE, [1]);
		await Robot_dcc(BASE, [BASE.robot.conf.default.dcc]);
		await Robot_go(BASE, overPillLocation);
		await Robot_speed(BASE, [BASE.robot.conf.default.speed]);
		await Robot_acc(BASE, [BASE.robot.conf.default.acc]);
		await Robot_go(BASE, baseLocation);
	}
	BASE.robot.actionDescPop();
	return true;
}
