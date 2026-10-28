import {Robot_go} from './go.js';
import {Robot_speed} from './speed.js';
import {Robot_acc} from './acc.js';
import {Robot_dcc} from './dcc.js';
import {Robot_gripper} from './gripper.js';
import {Robot_limitter} from './limitter.js';
import { Vector4 , Vector2} from './../../tools/Vector.js';
import {delay} from './../../tools/helpers.js';

export const Robot_throw = async (BASE)=>{
	BASE.robot.actionDesc = `Robot Throw`;
	if(BASE.robot.conf.simulation){
		BASE.robot.grabbedPill = null;
	}else{
		const alpha = Math.random() * 2 * Math.PI;
		const origin = new Vector2( 
			BASE.robot.conf.radius * Math.cos(alpha),
			BASE.robot.conf.radius * Math.sin(alpha)
		);
		const dest = new Vector2( 
			BASE.robot.conf.radius * Math.cos(alpha + Math.PI),
			BASE.robot.conf.radius * Math.sin(alpha + Math.PI)
		);

		await Robot_go(BASE, new Vector4(...origin, -100, 0), {enableDamping:false, curve:false});
		await Robot_go(BASE, new Vector4(...dest, 0, 0), {enableDamping:false, curve:false});
		await Robot_gripper(BASE, [false]);
		await delay(3000);
	}
	BASE.robot.actionDescPop();
	return true;
}