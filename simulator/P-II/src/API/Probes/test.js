import { Vector4, Vector2 } from './../../tools/Vector.js';
import { Robot_go, Robot_catch, Robot_grab, Robot_drop, Robot_speed, Robot_acc, Robot_dcc, Robot_gripper } from '../Robot';
import {delay} from './../../tools/helpers.js';
import {Memory_get, Memory_clear} from './../Memory';
import {Camera_capture} from './../Camera';


export const Probes_test = async (BASE)=>{

	await Robot_speed(BASE, [BASE.robot.conf.default.speed]);
	await Robot_acc(BASE, [BASE.robot.conf.default.acc]);
	await Robot_dcc(BASE, [BASE.robot.conf.default.dcc]);
	await Robot_gripper(BASE, [true]);

	const points = BASE.table.pointToExplore.sort(()=>Math.random()-0.5)
	

	await BASE.robot.controller.WaitProbe();

	for(const pos of points){
		const location = new Vector4(pos.x, pos.y, 0, 0);
		console.log(`GO to : ${location}`);
		await Robot_acc(BASE, [25]);
		await Robot_dcc(BASE, [25]);
		await Robot_go(BASE, location);
		await delay(1000);
		await Robot_drop(BASE);
		const pillLocation = BASE.robot.location4D;
		if(Memory_get(BASE, []).split("\n") == 0){
			console.log("Memory problem");
			return false;
		}
		console.log(BASE.robot.location2D.toString(), await Memory_get(BASE, []));
		await Memory_clear(BASE);

		for(let i = 0 ; i < 3 ; i ++){
			const rLocation = BASE.robot.location4D;
			rLocation.x += (Math.random()-0.5 * 2) * 25;
			rLocation.y += (Math.random()-0.5 * 2) * 25;
			await Robot_go(BASE, rLocation);
			await Camera_capture(BASE, [true])
			console.log(BASE.robot.location2D.toString(), await Memory_get(BASE, []));
			await Memory_clear(BASE);
		}

		await Robot_go(BASE, location);
		await Robot_catch(BASE);
		await BASE.robot.controller.WaitProbe();
	}
	return true;
}

