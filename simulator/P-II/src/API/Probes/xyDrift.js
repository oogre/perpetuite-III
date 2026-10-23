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

	const points = BASE.table.pointToExplore.sort(()=>Math.random()-0.5)

	// const points = [
	// 	new Vector2((Math.random()-0.5) * 2 * 600, (Math.random()-0.5) * 2 * 600),
	// 	new Vector2((Math.random()-0.5) * 2 * 600, (Math.random()-0.5) * 2 * 600)
	// ].sort(()=>Math.random()-0.5);
	
	await BASE.robot.controller.WaitProbe();

	const rows = [];/*[[RobotX1 RobotY1 PillX1 PillY1], [RobotX2 RobotY2 PillX2 PillY2], ...] vos lignes RobotX RobotY PillX PillY */
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
		const mathPillLocation = Memory_get(BASE, []);

		console.log([...theoricalPillLocation, ...mathPillLocation.location]);
		rows.push([...theoricalPillLocation, ...mathPillLocation.location]);
		
		await Robot_catch(BASE);
		await BASE.robot.controller.WaitProbe();
		await Memory_clear(BASE);
	}

	const { CX, CY, rms, max } = fitPolynomial(rows, 3);
	console.log(`à coller dans src/Camera/index.js:pointToWorldLocation`, `\nCX=${CX}`, `\nCX=${CY}`, `\nrms=${rms}`, `\nmax=${max}`);       // à coller dans pointToWorldLocation

	await Robot_gripper(BASE, [false]);
	return true;
}


/*
PREVIOUS DATA
RobotX | RobotY | PillX | PillY
355.49 | 355.66 | 345.65 | 347.71
-0.18 | 600.00 | -1.29 | 581.20
-246.99 | 246.98 | -241.87 | 242.48
-195.10 | 112.93 | -190.94 | 109.84
0.18 | -425.39 | -1.65 | -415.00
246.80 | 247.03 | 239.51 | 240.63
-425.50 | -0.07 | -416.53 | 0.02
337.91 | -90.66 | 327.51 | -88.26
368.24 | -212.28 | 356.95 | -207.24
-485.96 | 129.76 | -474.26 | 129.59
212.86 | 368.30 | 206.71 | 359.67
486.17 | 130.39 | 473.54 | 127.97
-0.19 | 225.46 | -0.75 | 218.91
-337.88 | 90.38 | -330.99 | 88.14
-130.36 | 486.03 | -128.13 | 473.53
-90.99 | 337.99 | -89.28 | 329.13
299.70 | -519.56 | 288.45 | -504.55
299.67 | 519.71 | 289.67 | 506.48
-299.67 | -519.69 | -290.94 | -502.49
-225.23 | -0.31 | -219.64 | 0.32
-90.81 | -338.05 | -89.29 | -328.95
368.52 | 212.69 | 358.02 | 208.31
-0.18 | 425.42 | -0.73 | 414.90
212.68 | -368.35 | 205.85 | -359.41
-355.50 | -355.63 | -346.01 | -348.16
91.19 | 337.93 | 87.76 | 329.39
112.50 | -194.84 | 107.51 | -189.01
0.18 | -599.99 | -2.23 | -581.94
0.18 | -0.20 | -1.04 | 0.35
-212.70 | 368.38 | -208.70 | 360.34
-519.65 | 300.11 | -502.80 | 299.79
337.81 | 91.00 | 327.24 | 88.43
425.26 | 0.42 | 413.20 | 0.11
-355.74 | 355.97 | -347.70 | 350.47
130.53 | 485.96 | 125.76 | 474.14
519.72 | 299.80 | 502.73 | 296.47
130.34 | -486.02 | 125.07 | -474.22
-0.19 | -225.22 | -1.56 | -218.60
-212.86 | -368.32 | -208.49 | -359.80
-299.72 | 519.52 | -291.10 | 506.22
-246.81 | -247.01 | -241.21 | -241.80
-112.85 | -194.93 | -110.63 | -189.86
-130.15 | -486.02 | -126.86 | -474.00
-368.27 | 212.29 | -360.10 | 209.52
485.95 | -129.86 | 472.30 | -128.01
-519.72 | -299.81 | -502.26 | -296.73
90.83 | -337.88 | 86.37 | -329.52
599.83 | -0.10 | 581.76 | -0.93
112.46 | 195.09 | 107.86 | 189.38
355.58 | -355.43 | 343.72 | -347.55
519.55 | -300.38 | 500.85 | -296.72
-599.99 | -0.13 | -580.77 | 0.29
-195.18 | -112.62 | -190.99 | -109.39
246.99 | -246.99 | 237.84 | -240.42
-368.17 | -212.62 | -360.35 | -208.86
195.13 | -112.90 | 187.61 | -108.91
-112.81 | 195.19 | -111.30 | 190.03
-337.82 | -90.98 | -331.42 | -88.79
195.21 | 112.59 | 189.29 | 109.63
225.21 | 0.28 | 218.17 | 0.84
-485.83 | -130.24 | -474.05 | -128.79
*/

