import { Vector4 } from './../../tools/Vector.js';

import {Probes_ground} from './ground.js';
import {Robot_go} from '../Robot/go.js';

export const Probes_floor = async (BASE)=>{
	BASE.table.points.forEach(({x, y})=>{
		console.log(new Vector4(x, y, 0, 0));
	//	await Robot_go(Base)
	});
	return true;

	//await Probes_ground(BASE);
	// robot.actionDesc = `Probes ground ${BASE.robot.location4D}`;
	// const location = await robot.controller.ZProbe(BASE.robot.location4D);	
	// robot.actionDescPop();
	// return new Vector4(...location);
}

