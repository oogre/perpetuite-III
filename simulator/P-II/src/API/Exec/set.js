import {spacedLog} from "./../../tools/helpers.js";
import Pills, {PillModel}  from "./../../Pills";
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
const move = async(BASE, pill, location, depth=0)=>{
	const LOG = spacedLog(depth, ">");
	BASE.robot.actionDesc = `${pill.color.style} ${location.style}`;
	LOG(`PUT ${pill.color.style} FROM ${pill.location.style} TO ${location.style}`);
	await Robot.Robot_go(BASE, location);
	const visiblePills = await Camera_capture(BASE);
	// 	NOGO :
	if(BASE.robot.hoverDangerousPlace){
		LOG(`NOGO`);
		const subTaskI = await BASE.cmd.getTask(pill.color.name);
		await move(BASE, pill, subTaskI.location, depth);
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
		await move(BASE, pill, subTaskI.location, depth+1);
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

// SET Color to XY
// 	Get PILL for Color
// 	CHECK PILL.XY
// 		NOGO :
// 			return SET Color at XY
// 		NOTHING : 
// 			return SET Color at XY
// 		PILL.COLOR != Color :
// 			return SET Color at XY
// 	MOVE PILL to XY
export const Exec_set = async(BASE, [colorName=(new PillModel.Color()).name, x=BASE.robot._location.x, y=BASE.robot._location.y], depth=1)=>{
	
	const task = new Pills(BASE.cmd.conf).createPill({
		avgRGB : (new PillModel.Color(colorName)).rgb,
		box:[x, y]
	});
	
	
	const pill = await Robot.Robot_findFreePillByColorName(BASE, task.color.name);
	if(BASE.robot.hoverDangerousPlace){
		return Exec_set(BASE, [colorName, x, y]);
	}
	if(!pill){
		return Exec_set(BASE, [colorName, x, y]);
	}
	if(pill.color.name != task.color.name){
		return Exec_set(BASE, [colorName, x, y]);
	}
	
	await move(BASE, pill, task.location);
	
	
}




