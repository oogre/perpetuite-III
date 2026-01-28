import {Camera_capture} from './../Camera';



export const Robot_drop = async ({robot, real, memory, camera, image, forbidden})=>{
	if(robot.grabbedPill===null){
		console.log("Nothing to drop");
		return false;
	}
	const cleanArea = memory.getByLocation(robot._location);
	const isCleanArea = cleanArea===undefined;
	if(!isCleanArea){
		memory.pills.delete(cleanArea);
	}
	await Camera_capture({robot, camera, memory, image, forbidden}, true)
	
	const targetedArea = memory.getByLocation(robot._location);
	const isTargetedAreaEmpty = targetedArea===undefined;
	if(!isTargetedAreaEmpty){
		console.log("DropZone is occupied");
		return false;	
	}
	robot.grabbedPill.location = robot._location;
	real.add(robot.grabbedPill);
	memory.add(robot.grabbedPill);
	robot.grabbedPill = null;
	return true;
}