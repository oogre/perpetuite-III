import { Vector4 } from './../../tools/Vector.js';

export const Probes_random = async (BASE)=>{
	const location = BASE.grid.getRandomCellLocation();
	
	// BASE.robot.actionDesc = `Probes random ${robot.location4D}`;
	// //const location = await robot.controller.ZProbe(robot.location4D);	
	// BASE.robot.actionDescPop();
	// return new Vector4(...location);
	return location;
}

