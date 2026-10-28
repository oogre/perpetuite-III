import {Robot_go} from './go.js';
import {Robot_gripper} from './gripper.js';
import {Robot_catch} from './catch.js';
import {Camera_capture} from './../Camera';
import {Memory_clean, Memory_get} from './../Memory';
import * as Hunting from './../Move/Hunting';
import {getRandomOne, delay} from './../../tools/helpers.js';
import {AppError, ERR } from './../../tools/Errors.js' ;


export const Robot_grab = async (BASE, [depth=0]=[])=>{
	
	BASE.robot.actionDesc = `Robot grab ${depth}`;
	
	if(depth >= 5 ){
		throw new AppError(ERR.GRAB, "Pill is not removed");
	}
	if(BASE.robot.conf.simulation){
		if(BASE.robot.grabbedPill!==null){
			throw new AppError(ERR.PROC, "Already grabbing");
		}
	}

	const robotLocationBefore = BASE.robot.location2D;
	const isMemoryCleanBefore = Memory_clean(BASE, robotLocationBefore);
	if(!isMemoryCleanBefore){
		throw new AppError(ERR.MEMORY, "Memory is a mess before");
	}

	if(Math.random()<0.9){
		const move = getRandomOne(Hunting);
		await move(BASE);
	}
	
	const beforeCollection = await Camera_capture(BASE)
	const targetedPill = Memory_get({memory:beforeCollection}, BASE.robot.location2D);
	const isTargetedPillExists = targetedPill!==undefined;
	if(isTargetedPillExists){
		await Robot_go(BASE, targetedPill.location);
	}else{
		throw new AppError(ERR.GRAB, "Pill is not present");
		return false;
	}

	await Robot_catch(BASE);
	
	const isMemoryCleanAfter = Memory_clean(BASE, BASE.robot.location2D)
	if(!isMemoryCleanAfter){
		throw new AppError(ERR.MEMORY, "Memory is a mess after");
	}
	
	const afterCollection = await Camera_capture(BASE, [true])
	const isRemoved = Memory_get({memory:afterCollection}, targetedPill) === null
	if(!isRemoved){
		await Robot_gripper(BASE, [false]);
		return await Robot_grab(BASE, [depth+1]);
	}
	BASE.robot.actionDescPop();
	return true;
}
