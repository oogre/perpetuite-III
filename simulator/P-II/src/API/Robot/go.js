
import { Vector3 } from './../../tools/Vector3.js';

export const Robot_go = async ({robot}, location)=>{
	await robot.go(new Vector3(...location));
	return true;
}
