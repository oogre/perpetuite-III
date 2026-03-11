
import { Vector4 } from './../../tools/Vector.js';
import { Robot_limitter } from './limitter.js';

export const Robot_go = async (BASE, location)=>{
	BASE.robot.actionDesc = `Robot go ${location}`;
	const origin = BASE.robot.location4D;
	const dest = Robot_limitter(BASE, new Vector4(...location, origin.z, origin.w));
	const move = new Vector4().subVectors(origin, dest);
	if(move.lengthSq() > 0.1){
		await BASE.robot.go(dest);	
	}
	BASE.robot.actionDescPop();
	return true;
}

