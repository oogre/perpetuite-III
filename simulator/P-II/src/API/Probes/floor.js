import { Vector4 } from './../../tools/Vector.js';
import {Probes_ground} from './ground.js';
import {Robot_go} from '../Robot/go.js';

export const Probes_floor = async (BASE)=>{
	console.log(BASE.table.points)

	BASE.table.points.forEach(point=>{
		console.log(point);
	//	await Robot_go(Base)
	});
	return true;

	//await Probes_ground(BASE);
	// robot.actionDesc = `Probes ground ${BASE.robot.location4D}`;
	// const location = await robot.controller.ZProbe(BASE.robot.location4D);	
	// robot.actionDescPop();
	// return new Vector4(...location);
}

