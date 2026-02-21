
import { Vector3 } from './../../tools/Vector3.js';
import { Robot_roll } from './roll.js';

export const Robot_go = async ({robot}, location)=>{

	await robot.go(new Vector3(...location));
	return true;
}
