

import {Robot_go} from './go.js';
import {Robot_gripper} from './gripper.js';
import {Robot_catch} from './catch.js';
import {Camera_capture} from './../Camera';
import {Memory_clean, Memory_get} from './../Memory';
import * as Hunting from './../Move/Hunting';
import {getRandomOne, delay} from './../../tools/helpers.js';


export const Robot_grab = async (BASE, [depth=0]=[])=>{
	
	BASE.robot.actionDesc = `Robot grab ${depth}`;
	
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

	if(Math.random()<0.1){
		const move = getRandomOne(Hunting);
		await move(BASE);
	}
	
	const beforeCollection = await Camera_capture(BASE)
	const targetedPill = Memory_get({memory:beforeCollection}, BASE.robot.location2D);
	const isTargetedPillExists = targetedPill!==undefined;
	if(isTargetedPillExists){
		await Robot_go(BASE, targetedPill.location);
	}else{
		console.log("pill Is not Present");
		return false;
	}

	await Robot_catch(BASE);
	
	const isMemoryCleanAfter = Memory_clean(BASE, BASE.robot.location2D)
	if(!isMemoryCleanAfter){
		throw new Error("MEMORY IS A MESS AFTER");
	}
	
	const afterCollection = await Camera_capture(BASE, true)
	
	await delay(300);

	const isRemoved = Memory_get({memory:afterCollection}, targetedPill) === null
	if(!isRemoved){
		await Robot_gripper(BASE, [false]);
		console.log("pill Is not Removed");
		await delay(1500);
		return await Robot_grab(BASE, [depth+1]);
	}
	BASE.robot.actionDescPop();
	return true;
}
