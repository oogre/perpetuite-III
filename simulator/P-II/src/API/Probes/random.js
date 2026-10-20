import { Vector4 } from './../../tools/Vector.js';

export const Probes_random = async (BASE)=>{
	const location = new Vector4(...BASE.grid.getRandomCellLocation(), -300, 0);



	// BASE.robot.actionDesc = `Probes random ${robot.location4D}`;
	// //const location = await robot.controller.ZProbe(robot.location4D);	
	// BASE.robot.actionDescPop();
	// return new Vector4(...location);
	return location;
}

