
import { Vector3 } from 'vecteur/3d';

export const Robot_go = async ({robot}, location)=>{
	await robot.go(new Vector3(...location));
	return true;
}
