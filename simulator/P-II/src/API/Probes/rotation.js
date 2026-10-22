import { Vector4, Vector2 } from './../../tools/Vector.js';
import { Robot_go, Robot_catch, Robot_drop, Robot_speed, Robot_acc, Robot_dcc, Robot_gripper } from '../Robot';
import {delay} from './../../tools/helpers.js';
import {Memory_get, Memory_clear} from './../Memory';
import { fitPolynomial } from './../../tools/fitPolynomial.js';

export const Probes_xyDrift = async (BASE)=>{

	await Robot_speed(BASE, [BASE.robot.conf.default.speed]);
	await Robot_acc(BASE, [BASE.robot.conf.default.acc]);
	await Robot_dcc(BASE, [BASE.robot.conf.default.dcc]);
	await Robot_gripper(BASE, [true]);


	const step = 20;
	const robot  = BASE.robot.location2D;
	const points = new Array(10).fill(0).map((_, id, {length})=>
		new Vector2(  
			-1 * ((length*step) / 2) + step * id , 
			0
		).add(robot)
	);

	


	
	for(const pos of points){
		const location = new Vector4(pos.x, pos.y, 0, 0);
		await Robot_acc(BASE, [25]);
		await Robot_dcc(BASE, [25]);
		await Robot_go(BASE, location);
		await BASE.robot.controller.WaitProbe();
		await delay(1000);
		await Robot_drop(BASE);
		if(Memory_get(BASE, []).split("\n") == 0){
			console.log("Memory problem");
			await Robot_gripper(BASE, [false]);
			return false;
		}
		await Memory_clear(BASE);
	}

	await Robot_gripper(BASE, [false]);
	return true;
}