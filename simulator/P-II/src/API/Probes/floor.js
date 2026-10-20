import { Vector4 } from './../../tools/Vector.js';
import {Probes_ground} from './ground.js';
import {Robot_go} from '../Robot/go.js';
import fs from 'fs-extra';

export const Probes_floor = async (BASE)=>{
	BASE.robot.actionDesc = `Probes_floor`;
	const floorProbes = [];
	for(const {x,y} of BASE.table.points){
		await BASE.robot.setSeed(BASE.robot.conf.default.speed);
		await BASE.robot.setAcceleration(BASE.robot.conf.default.acc);
		await BASE.robot.setDeceleration(BASE.robot.conf.default.dcc);
		await Robot_go(BASE, new Vector4(x, y, 0, 0))
		await BASE.robot.controller.WaitProbe();
		const {z} = await Probes_ground(BASE);
		floorProbes.push(pointProbes);
	};
	BASE.robot.actionDescPop();

	fs.writeFileSync(BASE.table.conf.zValuesPath, JSON.stringify(floorProbes, null, 2));

	return floorProbes;
}