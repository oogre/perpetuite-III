

import {Robot_go} from './go.js';
import {Camera_capture} from './../Camera';
import {Memory_clean, Memory_get} from './../Memory';


export const Robot_grab = async ({robot, real, memory, camera, image, forbidden})=>{
	if(robot.grabbedPill!==null){
		console.log("Already grabbing");
		return false;
	}
	const isMemoryCleanBefore = Memory_clean({memory}, robot._location)
	if(!isMemoryCleanBefore){
		throw new Error("MEMORY IS A MESS BEFORE");
	}
	const beforeCollection = await Camera_capture({robot, camera, memory, image, forbidden})
	
	const targetedPill = Memory_get({memory:beforeCollection}, robot._location);
	const isTargetedPillExists = targetedPill!==undefined;
	if(isTargetedPillExists){
		await Robot_go({robot}, targetedPill.location);
	}else{
		console.log("pill Is not Present")
		return false;
	}
	
	await real.delete(targetedPill);

	const isMemoryCleanAfter = Memory_clean({memory}, robot._location)
	if(!isMemoryCleanAfter){
		throw new Error("MEMORY IS A MESS AFTER");
	}
	const afterCollection = await Camera_capture({robot, camera, memory, image, forbidden})
	const isRemoved = Memory_get({memory:afterCollection}, targetedPill) === null
	if(!isRemoved){
		console.log("pill Is not Removed");
		return false;
	}

	robot.grabbedPill = targetedPill;
	return true;
}
