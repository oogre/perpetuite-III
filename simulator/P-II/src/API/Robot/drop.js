import {Camera_capture} from './../Camera';
import {Memory_get, Memory_clean} from './../Memory';
import {Robot_release} from './release.js';
import {AppError, ERR } from './../../tools/Errors.js' ;

const MAX_SECURITY = true;

export const Robot_drop = async (BASE)=>{
	BASE.robot.actionDesc = `Robot drop`;

	if(BASE.robot.conf.simulation){
		if(BASE.robot.grabbedPill===null){
			throw new AppError(ERR.PROC, "Nothing to drop");
		}
	}
	if(MAX_SECURITY){
		Memory_clean(BASE, BASE.robot.location2D)
		await Camera_capture(BASE);
		const targetedArea = Memory_get(BASE, BASE.robot.location2D);
		const isTargetedAreaEmpty = targetedArea===undefined;
		if(!isTargetedAreaEmpty){
			throw new AppError(ERR.DROP, "DropZone is occupied");
		}
	}

	await Robot_release(BASE);

	await Camera_capture(BASE, [true]);
	BASE.robot.actionDescPop();
	return true;
}
