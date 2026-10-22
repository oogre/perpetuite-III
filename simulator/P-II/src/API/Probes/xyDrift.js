import { Vector4 } from './../../tools/Vector.js';
import { Robot_go, Robot_catch, Robot_drop, Robot_speed, Robot_acc, Robot_dcc, Robot_gripper } from '../Robot';
import {delay} from './../../tools/helpers.js';
import {Memory_get, Memory_clear} from './../Memory';
import { fitPolynomial } from './../../tools/fitPolynomial.js';

export const Probes_test = async (BASE)=>{

	await Robot_speed(BASE, [BASE.robot.conf.default.speed]);
	await Robot_acc(BASE, [BASE.robot.conf.default.acc]);
	await Robot_dcc(BASE, [BASE.robot.conf.default.dcc]);
	await Robot_gripper(BASE, [true]);

	const points = BASE.table.pointToExplore.sort(()=>Math.random()-0.5)
	await BASE.robot.controller.WaitProbe();

	const rows = [];/*[[RobotX1 RobotY1 PillX1 PillY1], [RobotX2 RobotY2 PillX2 PillY2]] ... vos lignes RobotX RobotY PillX PillY */
	for(const pos of points){
		const location = new Vector4(pos.x, pos.y, 0, 0);
		await Robot_acc(BASE, [25]);
		await Robot_dcc(BASE, [25]);
		await Robot_go(BASE, location);
		await delay(1000);
		await Robot_drop(BASE);
		if(Memory_get(BASE, []).split("\n") == 0){
			console.log("Memory problem");
			await Robot_gripper(BASE, [false]);
			return false;
		}
		const theoricalPillLocation = BASE.robot.location2D;
		const mathPillLocation = await Memory_get(BASE, BASE.robot.location2D):
		
		rows.push([...theoricalPillLocation, ...mathPillLocation.location])
		
		await Robot_catch(BASE);
		await BASE.robot.controller.WaitProbe();
		await Memory_clear(BASE);
	}

	const { CX, CY, rms, max } = fitPolynomial(rows, 3);
	console.log(`à coller dans src/Camera/index.js:pointToWorldLocation`, `\nCX=${CX}`, `\nCX=${CY}`, `\nrms=${rms}`, `\nmax=${max}`);       // à coller dans pointToWorldLocation

	await Robot_gripper(BASE, [false]);
	return true;
}

