
import {Memory_lock} from './../Memory';
import {Robot_go} from './go.js';
import {Robot_grab} from './grab.js';
import {Robot_drop} from './drop.js';
import {Robot_cleanForColor, CLEAN_RESULT} from './cleanForColor.js';
import {Robot_findFreePillByColorName} from './findFreePillByColorName.js';
import {spacedLog} from "./../../tools/helpers.js";

export const Robot_putPillAt = async(BASE, task, targetPill=null, depth=1)=>{
	const LOG = spacedLog(depth, ">");
	BASE.robot.actionDesc = `${task.toString()}`;
	LOG(`Put ${task.color.style} @ ${task.location.style}`);
	
	console.log(task.location);

	await Robot_go(BASE, task.location);
	let cleanResult = await Robot_cleanForColor(BASE, task.color.name, targetPill, depth)
	
	switch(cleanResult){
		case CLEAN_RESULT.GOOD:
			Memory_lock(BASE, task.location);
		case CLEAN_RESULT.NO_GO :
			LOG(`Put ${task.color.style} @ ${task.location.style} : ${cleanResult == CLEAN_RESULT.GOOD ? "DONE" : "PASS" }`);
			BASE.robot.actionDescPop();
			return true;
	}
	
	
	let counter = 0;
	do{
		if(counter++ > 5)throw new Error("Too much grab try");
		if(targetPill==null || counter>1){
			targetPill = await Robot_findFreePillByColorName(BASE, task.color.name);
		}
		LOG(`Find ${targetPill.color.style} @ ${targetPill.location.style}`);
		await Robot_go(BASE, targetPill.location);
	}while(!await Robot_grab(BASE));

	await Robot_go(BASE, task.location);
	await Robot_drop(BASE);
	
	Memory_lock(BASE, task.location);
	LOG(`Put ${task.color.style} @ ${task.location.style} : DONE`);
	BASE.robot.actionDescPop();
	return true;
}