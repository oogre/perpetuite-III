

import {Robot_go} from './go.js';
import {Camera_capture} from './../Camera';
import {Memory_clean, Memory_get} from './../Memory';


export const Robot_grab = async (BASE, depth=0)=>{
	BASE.robot.actionDesc = `Robot grab`;
	
	if(depth >= 5 ){
		throw new Error("Error grabbing");
	}

	if(BASE.robot.grabbedPill!==null){
		throw new Error("Already grabbing");
		return false;
	}
	const robotLocationBefore = BASE.robot.location2D;
	const isMemoryCleanBefore = Memory_clean(BASE, robotLocationBefore);
	if(!isMemoryCleanBefore){
		throw new Error("MEMORY IS A MESS BEFORE");
	}
	const beforeCollection = await Camera_capture(BASE)
	
	const targetedPill = Memory_get({memory:beforeCollection}, robotLocationBefore);
	const isTargetedPillExists = targetedPill!==undefined;
	if(isTargetedPillExists){
		await Robot_go(BASE, targetedPill.location);
	}else{
		console.log("pill Is not Present");
		return false;
	}
	const robotLocationAfter = BASE.robot.location2D;
	const realPill = Memory_get({memory:BASE.real}, robotLocationAfter);
	await BASE.real.delete(realPill);
	BASE.robot.grabbedPill = realPill;

	const isMemoryCleanAfter = Memory_clean(BASE, robotLocationAfter)
	if(!isMemoryCleanAfter){
		throw new Error("MEMORY IS A MESS AFTER");
	}
	const afterCollection = await Camera_capture(BASE, true)
	const isRemoved = Memory_get({memory:afterCollection}, targetedPill) === null
	if(!isRemoved){
		console.log("pill Is not Removed");
		return await Robot_grab(BASE, depth+1);
	}
	BASE.robot.actionDescPop();
	return true;
}
