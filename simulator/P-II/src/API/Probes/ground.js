import { Vector4 } from './../../tools/Vector.js';

export const Probes_ground = async ({robot})=>{
	robot.actionDesc = `Probes ground ${robot.location4D}`;
	const location = await robot.controller.ZProbe(robot.location4D);	
	robot.actionDescPop();
	return new Vector4(...location);
}

