import { Vector4, Vector2 } from './../../tools/Vector.js';
import { Robot_go, Robot_catch, Robot_grab, Robot_drop, Robot_speed, Robot_acc, Robot_dcc, Robot_gripper } from '../Robot';
import {delay} from './../../tools/helpers.js';
import {Memory_get, Memory_clear} from './../Memory';

export const Probes_test = async (BASE)=>{

	await Robot_speed(BASE, [BASE.robot.conf.default.speed]);
	await Robot_acc(BASE, [BASE.robot.conf.default.acc]);
	await Robot_dcc(BASE, [BASE.robot.conf.default.dcc]);
	await Robot_gripper(BASE, [true]);
	await BASE.robot.controller.WaitProbe();
	

	

	for(let i = 0 ; i < 4 ; i ++){
		const location = new Vector4(250, 250, 0, 0);

		await Robot_acc(BASE, [25]);
		await Robot_dcc(BASE, [25]);
		await Robot_go(BASE, location);
		const robotLocation = BASE.robot.location4D;
		await delay(1000);
		await Robot_drop(BASE);
		const pillLocation = BASE.robot.location4D;
		console.log(BASE.robot.location2D.toString(), await Memory_get(BASE, []));
		if(Memory_get(BASE, []).split("\n") == 0){
			return false;
		}
		await Robot_grab(BASE);
		const grabLocation = BASE.robot.location4D;
		await Memory_clear(BASE);
		
		location.x = grabLocation.x;
		location.y = grabLocation.y;

		
		console.log(`pill : ${pillLocation}`)
		console.log(`grabbed : ${grabLocation}`)

	}
	return true;
}

