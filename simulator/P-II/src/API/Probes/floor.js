import { Vector4 } from './../../tools/Vector.js';

import {Probes_ground} from './ground.js';
import {Robot_go} from '../Robot/go.js';

export const Probes_floor = async (BASE)=>{
	BASE.robot.actionDesc = `Probes_floor`;
	const floorProbes = [];
	for(const {x,y} of BASE.table.points){
		await BASE.robot.setSeed(50);
		await BASE.robot.setAcc(50);
		await BASE.robot.setDcc(50);
		await Robot_go(BASE, new Vector4(x, y, 0, 0))
		await BASE.robot.controller.WaitProbe();
		const pointProbes = await Probes_ground(BASE);
		floorProbes.push(pointProbes);
	};
	BASE.robot.actionDescPop();
	return floorProbes;
}

