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
	const points = [BASE.table.pointToExplore[0], BASE.table.pointToExplore[0], BASE.table.pointToExplore[0], BASE.table.pointToExplore[0], BASE.table.pointToExplore[0]].sort(()=>Math.random()-0.5)
	for(const pos of points){
		const location = new Vector4(pos.x, pos.y, 0, 0);
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
		
		console.log(`asked : ${location}`)
		console.log(`above : ${robotLocation}`)
		console.log(`pill : ${pillLocation}`)
		console.log(`grabbed : ${grabLocation}`)

	}
	return true;
}

