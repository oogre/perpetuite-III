import {spacedLog} from "./../../tools/helpers.js";
import * as Robot from "./../Robot";
import {Exec_dropErrorHandling} from './dropErrorHandling.js'
import {Camera_capture} from './../Camera';
import {Memory_lock} from './../Memory';
import {Move_mechanicalSheep} from './../Move/Trip';
import {AppError, ERR } from './../../tools/Errors.js' ;

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
	BASE.robot.actionDesc = `${pill.color.name} > ${location.toString()}`;
	try{
		const LOG = spacedLog(depth, ">");

		LOG(`PUT ${pill.color.style} FROM ${pill.location.style} TO ${location.style}`);
		
		await Robot.Robot_go(BASE, location);
		const visiblePills = await Camera_capture(BASE);
		
		// 	NOGO :
		if(BASE.forbidden.isIntersect(pill)){
			LOG(`NOGO`);
			const subTaskI = await BASE.cmd.getTask(pill.color.name);
			return await Exec_move(BASE, pill, subTaskI.location, depth);
		}
		const pills = visiblePills.getByBox([
			...BASE.robot.location2D, 
			visiblePills.conf.radius.value*2, 
			visiblePills.conf.radius.value*2
		]);

		if(depth == 0){
			const goodColorId = pills.findIndex(({color:{name:colorName}})=>colorName==pill.color.name);
			if (goodColorId > -1) {
				const oldPill = pill;
				[pill] = pills.splice(goodColorId, 1);
				LOG(`REPLACE ${oldPill.color.style} @ ${oldPill.location.style} BY ${pill.color.style} @ ${pill.location.style}`);
				return true;
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
		if(Math.random() < 0.05){
			await Move_mechanicalSheep(BASE);
		}
		await Robot.Robot_go(BASE, location);

		const MAX_DROP_TRIES = 3;
		for(let attempt = 1; ; attempt++){
			try{
				await Robot.Robot_drop(BASE);
				break;
			}catch(error){
				const isDropError = error instanceof AppError && error.is(ERR.DROP);
				if(!isDropError || attempt >= MAX_DROP_TRIES) throw error;
				await Exec_dropErrorHandling(BASE);       // dépose la pill à sa place, en déplaçant celle qui gênait
			}
		}
		Memory_lock(BASE, location);

		
		return true;
	}finally{
		LOG(`DONE ${pill.color.style} @  ${location.style}`);
		BASE.data.history.tasks.push({
			color : pill.color.name,
			location : location.toArray()
		});
		BASE.robot.actionDescPop();                   // toujours, une seule fois
	}
}