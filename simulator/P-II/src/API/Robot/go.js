
import { Vector4 } from './../../tools/Vector.js';
import { Robot_roll } from './roll.js';

export const Robot_go = async ({robot}, location)=>{
	const dest = new Vector4(...location, robot._location.z, robot._location.w);
	await robot.go(dest);
	return true;
}
