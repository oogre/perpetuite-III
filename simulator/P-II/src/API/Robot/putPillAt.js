
import {Robot_go} from './go.js';
import {Robot_grab} from './grab.js';
import {Robot_drop} from './drop.js';
import {Robot_cleanForColor} from './cleanForColor.js';
import {Robot_findFreePillByColorName} from './findFreePillByColorName.js';
import {spacedLog} from "./../../tools/helpers.js";


export const Robot_putPillAt = async(BASE, task, targetPill=null, depth=1)=>{
	const LOG = spacedLog(depth, ">");
	BASE.robot.actionDesc = `${task.toString()}`;

	LOG(`Put ${task.color.style} @ ${task.location.toStyled()}`);

	await Robot_go(BASE, task.location);
	const isTaskExecuted = await Robot_cleanForColor(BASE, task.color.name, targetPill, LOG, depth);
	if(isTaskExecuted){
		LOG(`Put ${task.color.style} @ ${task.location.toStyled()} : DONE`);
		BASE.robot.actionDescPop();
		return true;
	}
	LOG(`${task.location.toStyled()} is empty`);

	const pill = targetPill || await Robot_findFreePillByColorName(BASE, task.color.name);
	LOG(`Find ${pill.color.style} @ ${pill.location.toStyled()}`);
	
	await Robot_go(BASE, pill.location);
	await Robot_grab(BASE);
	await Robot_go(BASE, task.location);
	await Robot_drop(BASE);
	
	LOG(`Put ${task.color.style} @ ${task.location.toStyled()} : DONE`);
	BASE.robot.actionDescPop();
	return true;
}