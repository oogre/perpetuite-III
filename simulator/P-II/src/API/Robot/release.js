import {Robot_go} from './go.js';
import {Robot_speed} from './speed.js';
import {Robot_acc} from './acc.js';
import {Robot_dcc} from './dcc.js';
import {Robot_gripper} from './gripper.js';
import {Robot_limitter} from './limitter.js';
import { Vector4 } from './../../tools/Vector.js';
import {delay} from './../../tools/helpers.js';

export const Robot_release = async (BASE)=>{
	BASE.robot.actionDesc = `Robot Release`;
	try{
		if(BASE.robot.conf.simulation){
			BASE.robot.grabbedPill.location = BASE.robot.location2D;
			await BASE.real.add(BASE.robot.grabbedPill);
			BASE.robot.grabbedPill = null;
		}else{
			await Robot_go(BASE, new Vector4(...BASE.robot.location2D, 0, 0));
			const baseLocation = BASE.robot.location4D;
			const pillLocation = Robot_limitter(BASE, new Vector4(baseLocation.x, baseLocation.y, -300, baseLocation.w));
			const overPillLocation = new Vector4(pillLocation.x, pillLocation.y, pillLocation.z+5, pillLocation.w);
			await Robot_go(BASE, pillLocation, {enableDamping:false, curve:false});
			await Robot_gripper(BASE, [false]);
			await delay(200);
			await Robot_acc(BASE, [1]);
			await Robot_go(BASE, overPillLocation, {enableDamping:false, curve:false});
			await Robot_acc(BASE, [BASE.robot.conf.default.acc]);
			await Robot_go(BASE, baseLocation, {enableDamping:false, curve:false});
		}
		return true;
	}finally{
		BASE.robot.actionDescPop();                   // toujours, une seule fois
	}
}