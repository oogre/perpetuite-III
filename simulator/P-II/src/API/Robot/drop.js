import {Camera_capture} from './../Camera';
import {Memory_get, Memory_clean} from './../Memory';

const MAX_SECURITY = false;

export const Robot_drop = async (BASE)=>{
	if(BASE.robot.grabbedPill===null){
		throw new Error("Nothing to drop");
		return false;
	}

	if(MAX_SECURITY){
		Memory_clean(BASE, BASE.robot._location)
		await Camera_capture(BASE)
		const targetedArea = Memory_get(BASE, BASE.robot._location);
		const isTargetedAreaEmpty = targetedArea===undefined;
		if(!isTargetedAreaEmpty){
			throw new Error("DropZone is occupied");
			return false;	
		}
	}
	
	BASE.robot.grabbedPill.location = BASE.robot._location;
	await BASE.real.add(BASE.robot.grabbedPill);
	BASE.robot.grabbedPill = null;

	await Camera_capture(BASE, true);

	return true;
}
