import {Robot_go} from './go.js';
import {Robot_speed} from './speed.js';
import {Robot_acc} from './acc.js';
import {Robot_dcc} from './dcc.js';
import {Robot_gripper} from './gripper.js';
import {Robot_limitter} from './limitter.js';
import {Memory_get} from './../Memory';
import { Vector4 } from './../../tools/Vector.js';
import {delay} from './../../tools/helpers.js';

export const Robot_catch = async (BASE)=>{
	BASE.robot.actionDesc = `Robot catch`;
	try{
		if(BASE.robot.conf.simulation){
			const realPill = Memory_get({memory:BASE.real}, BASE.robot.location2D);
			await BASE.real.delete(realPill);
			BASE.robot.grabbedPill = realPill;
		}else{
			await Robot_go(BASE, new Vector4(...BASE.robot.location2D, 0, 0), {enableDamping:false, curve:false});
			const baseLocation = BASE.robot.location4D;
			const pillLocation = Robot_limitter(BASE, new Vector4(baseLocation.x, baseLocation.y, -300, baseLocation.w));
			await Robot_go(BASE, pillLocation, {enableDamping:false, curve:false});
			await Robot_gripper(BASE, [true]);
			await delay(200);
			await Robot_go(BASE, baseLocation, {enableDamping:false, curve:false});
		}
		return true;
	}finally{
		BASE.robot.actionDescPop();                   // toujours, une seule fois
	}
}
