import {spacedLog} from "./../../tools/helpers.js";
import * as Robot from "./../Robot";
import {Camera_capture} from './../Camera';
import {Memory_lock} from './../Memory';

// MOVE PILL to XY
// Check XY
// 	NOGO :
// 		Get TASK for PILL.COLOR
// 		MOVE PILL.XY to TASK.UV
// 		return
// 	SOMTHING :
// 		Get PILLS at UV
// 		LOOP PILLS:PILL
// 			Get TASK for PILL.COLOR
// 			MOVE PILL.XY to TASK.UV
// 	DEFAULT :
// 		GO PILL.XY
// 		GRAB
// 		GO XY
// 		DROP
export const Exec_move = async(BASE, pill, location, depth=0)=>{
	const LOG = spacedLog(depth, ">");
	BASE.robot.actionDesc = `${pill.color.style} ${location.style}`;
	LOG(`PUT ${pill.color.style} FROM ${pill.location.style} TO ${location.style}`);
	
	await Robot.Robot_go(BASE, location);
	const visiblePills = await Camera_capture(BASE);
	
	// 	NOGO :
	if(BASE.robot.hoverDangerousPlace){
		LOG(`NOGO`);
		const subTaskI = await BASE.cmd.getTask(pill.color.name);
		await Exec_move(BASE, pill, subTaskI.location, depth);
		return;
	}
	const pills = visiblePills.getByBox([
		BASE.robot._location.x, 
		BASE.robot._location.y, 
		visiblePills.conf.radius.value*3, 
		visiblePills.conf.radius.value*3
	]);

	if(depth == 0){
		const goodColorId = pills.findIndex(({color:{name:colorName}})=>colorName==pill.color.name);
		if (goodColorId > -1) {
			const oldPill = pill;
			[pill] = pills.splice(goodColorId, 1);
			LOG(`REPLACE ${oldPill.color.style} @ ${oldPill.location.style} BY ${pill.color.style} @ ${pill.location.style}`);
		}
	}

	// 	SOMTHING :
	for(const pill of pills){
		const subTaskI = await BASE.cmd.getTask(pill.color.name)
		await Exec_move(BASE, pill, subTaskI.location, depth+1);
	}

	// 	DEFAULT :
	await Robot.Robot_go(BASE, pill.location);
	await Robot.Robot_grab(BASE);
	await Robot.Robot_go(BASE, location);
	await Robot.Robot_drop(BASE);
	Memory_lock(BASE, location);

	LOG(`DONE ${pill.color.style} @  ${location.style}`);
	BASE.robot.actionDescPop();
}