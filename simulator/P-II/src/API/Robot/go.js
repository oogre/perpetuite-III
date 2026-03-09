
import { Vector4 } from './../../tools/Vector.js';

export const Robot_go = async ({robot}, location)=>{
	robot.actionDesc = `Robot go ${location}`;
	const dest = new Vector4(...location, robot._location.z, robot._location.w);
	await robot.go(dest);
	robot.actionDescPop();
	return true;
}
