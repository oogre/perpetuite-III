import {Camera_capture} from './../Camera';
import {Memory_get, Memory_clean} from './../Memory';
import { Vector2 } from './../../tools/Vector.js';
import {Robot_release} from './release.js';

const MAX_SECURITY = false;

export const Robot_drop = async (BASE)=>{
	BASE.robot.actionDesc = `Robot drop`;

	if(BASE.robot.conf.simulation){
		if(BASE.robot.grabbedPill===null){
			throw new Error("Nothing to drop");
			return false;
		}
		
		if(MAX_SECURITY){
			Memory_clean(BASE, BASE.robot.location2D)
			await Camera_capture(BASE)
			const targetedArea = Memory_get(BASE, BASE.robot.location2D);
			const isTargetedAreaEmpty = targetedArea===undefined;
			if(!isTargetedAreaEmpty){
				throw new Error("DropZone is occupied");
				return false;	
			}
		}
	}
	await Robot_release(BASE);

	await Camera_capture(BASE, [true]);
	BASE.robot.actionDescPop();
	return true;
}
