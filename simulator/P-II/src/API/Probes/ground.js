import { Vector4 } from './../../tools/Vector.js';

export const Probes_ground = async (BASE)=>{
	BASE.robot.actionDesc = `Probes ground ${BASE.robot.location4D}`;
	try{
		const location = await robot.controller.ZProbe(BASE.robot.location4D);	
		return new Vector4(...location);
	}finally{
		BASE.robot.actionDescPop();
	}
}

