

import {Robot_go} from './go.js';
import {Camera_capture} from './../Camera';
import {Memory_clean, Memory_get} from './../Memory';


export const Robot_grab = async (BASE, depth=0)=>{
	if(depth >= 5 ){
		throw new Error("Error grabbing");
	}

	if(BASE.robot.grabbedPill!==null){
		throw new Error("Already grabbing");
		return false;
	}
	const isMemoryCleanBefore = Memory_clean(BASE, BASE.robot._location)
	if(!isMemoryCleanBefore){
		throw new Error("MEMORY IS A MESS BEFORE");
	}
	const beforeCollection = await Camera_capture(BASE)
	
	const targetedPill = Memory_get({memory:beforeCollection}, BASE.robot._location);
	const isTargetedPillExists = targetedPill!==undefined;
	if(isTargetedPillExists){
		await Robot_go(BASE, targetedPill.location);
	}else{
		throw new Error("pill Is not Present");
	}
	
	await BASE.real.delete(targetedPill);

	const isMemoryCleanAfter = Memory_clean(BASE, BASE.robot._location)
	if(!isMemoryCleanAfter){
		throw new Error("MEMORY IS A MESS AFTER");
	}
	const afterCollection = await Camera_capture(BASE)
	const isRemoved = Memory_get({memory:afterCollection}, targetedPill) === null
	if(!isRemoved){
		console.log("pill Is not Removed");
		return await Robot_grab(BASE, depth+1);
	}

	BASE.robot.grabbedPill = targetedPill;
	return true;
}
