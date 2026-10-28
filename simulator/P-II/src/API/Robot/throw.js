import {Robot_go} from './go.js';
import {Robot_speed} from './speed.js';
import {Robot_acc} from './acc.js';
import {Robot_dcc} from './dcc.js';
import {Robot_gripper} from './gripper.js';
import {Robot_limitter} from './limitter.js';
import { Vector4 , Vector2} from './../../tools/Vector.js';
import {delay} from './../../tools/helpers.js';


// à mettre dans tools/helpers.js ou dans Robot_throw
const untilWithin = (BASE, dest, distance)=>new Promise(resolve=>{
	const check = ()=>{
		if(BASE.robot.location3D.distanceTo(dest) <= distance){
			resolve();
		}
		else setTimeout(check, 10);
	};
	check();
});

export const Robot_throw = async (BASE)=>{
	BASE.robot.actionDesc = `Robot Throw`;
	if(BASE.robot.conf.simulation){
		BASE.robot.grabbedPill = null;
	}else{
		const origin = BASE.robot.location4D;
		const start = new Vector3(origin.x, origin.y, 0);
		start.setLength(BASE.robot.conf.radius);
		start.z = -100
		const offAlpha = new Vector2(...start).angle(); 
		const dest = new Vector3( 
			BASE.robot.conf.radius * Math.cos(offAlpha + Math.PI),
			BASE.robot.conf.radius * Math.sin(offAlpha + Math.PI),
			0
		);
		await Robot_go(BASE, new Vector4(...start, 0), {enableDamping:false, curve:false});
		const arrival = Robot_go(BASE, last, {enableDamping:false, curve:false});   // PAS de await
		await Promise.race([untilWithin(BASE, dest, 300), arrival]);      // arrival : si le go finit (ou échoue) avant, on sort
		const grip = Robot_gripper(BASE, [false]);
		await Promise.all([grip, arrival]);
		await delay(3000);
	}
	BASE.robot.actionDescPop();
	return true;
}