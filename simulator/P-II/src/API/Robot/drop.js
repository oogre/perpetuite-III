import {Camera_capture} from './../Camera';
import {Memory_get, Memory_clean} from './../Memory';


export const Robot_drop = async ({robot, real, memory, camera, image, forbidden})=>{
	if(robot.grabbedPill===null){
		console.log("Nothing to drop");
		return false;
	}
	Memory_clean({memory}, robot._location)
	await Camera_capture({robot, camera, memory, image, forbidden})
	
	const targetedArea = Memory_get({memory}, robot._location);
	const isTargetedAreaEmpty = targetedArea===undefined;
	if(!isTargetedAreaEmpty){
		console.log("DropZone is occupied");
		return false;	
	}

	robot.grabbedPill.location = robot._location;
	await real.add(robot.grabbedPill);
	robot.grabbedPill = null;

	await Camera_capture({robot, camera, memory, image, forbidden})

	return true;
}