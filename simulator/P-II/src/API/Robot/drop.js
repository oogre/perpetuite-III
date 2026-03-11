import {Camera_capture} from './../Camera';
import {Memory_get, Memory_clean} from './../Memory';
import { Vector2 } from './../../tools/Vector.js';

const MAX_SECURITY = false;

export const Robot_drop = async (BASE)=>{
	BASE.robot.actionDesc = `Robot drop`;

	if(BASE.robot.grabbedPill===null){
		throw new Error("Nothing to drop");
		return false;
	}
	const robotLocation = BASE.robot.location2D;
	if(MAX_SECURITY){
		Memory_clean(BASE, robotLocation)
		await Camera_capture(BASE)
		const targetedArea = Memory_get(BASE, robotLocation);
		const isTargetedAreaEmpty = targetedArea===undefined;
		if(!isTargetedAreaEmpty){
			throw new Error("DropZone is occupied");
			return false;	
		}
	}
	
	BASE.robot.grabbedPill.location = robotLocation;
	await BASE.real.add(BASE.robot.grabbedPill);
	BASE.robot.grabbedPill = null;

	await Camera_capture(BASE, true);
	BASE.robot.actionDescPop();
	return true;
}
