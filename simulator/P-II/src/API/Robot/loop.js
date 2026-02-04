import Enum from 'enum';

import {Robot_go} from './go.js';
import {Robot_grab} from './grab.js';
import {Robot_drop} from './drop.js';
import {Camera_capture} from './../Camera';
import {Memory_get} from './../Memory';
import {nTry, spacedLog} from "./../../tools/helpers.js";

import {Color} from "./../../Pills/PillModel";

let hasToLoop = false;

export const Robot_loop = async (BASE)=>{
	const nexTask = await BASE.cmd.getTask();
	hasToLoop = true;

	for(const [x, y] of BASE.table.points){
		await Robot_go(BASE, [x, y, 0]);
		await Camera_capture(BASE);	
		if(!hasToLoop)break;
	}
	
	loop(BASE, nexTask);
}

export const Robot_stop = ({})=>{
	hasToLoop = false;
}

const loop = async(BASE, task, targetPill=null, depth=1)=>{
	if(targetPill === null && !hasToLoop){
		return;// BREAK LOOP	
	}
	if(targetPill === null){
		console.log(" ");
	}
	const LOG = spacedLog(depth, ">");
	const trigFinish = async()=>{
		LOG(`Put ${task.colorStyled} @ ${task.positionStyled} : DONE`);

		// >>> MAYBE REVIEW THE LOCKING SYSTEME
		//const nPill = BASE.memory.getByLocation(task.location);
		//nPill.lock();
		
		if(targetPill===null){
			const nexTask = await BASE.cmd.getTask();
			LOG(`Still ${BASE.cmd.length} tasks`)
			return loop(BASE, nexTask);	
		}
		return; 
	}

	
	LOG(`Put ${task.colorStyled} @ ${task.positionStyled}`);
	switch(await whatsAtDropArea(BASE, task)){
		case CHECK_STATUS.NO_GO :
			LOG(`${task.positionStyled} is NO GO AREA`);
			if(targetPill===null){
				return await trigFinish();
			}else{
				const subTask = await BASE.cmd.getTask(task.color.name)
				await loop(BASE, subTask, targetPill, depth+1);
			}
		break;
		case CHECK_STATUS.GOOD_COLOR : 
			LOG(`${task.positionStyled} is ${task.colorStyled} : GOOD COLOR`);
			if(targetPill===null){
				return await trigFinish();
			}else{
				//fallback on WRONG_COLOR
			}
		case CHECK_STATUS.WRONG_COLOR:
			const pill = await Memory_get(BASE, task.location);
			LOG(`${task.positionStyled} is ${pill.colorStyled} : WRONG COLOR`);
			const subTask = await BASE.cmd.getTask(pill.color.name);
			await loop(BASE, subTask, pill, depth+1);
		break;
	}
	LOG(`${task.positionStyled} is empty`);
	const pill = targetPill || await findFreePillByColorName(BASE, LOG, task.color.name);
	await Robot_go(BASE, pill.location);

	const grabResult = await nTry(5, async(tryCount)=>await Robot_grab(BASE));
	if(!grabResult){
		return LOG(`${task.positionStyled} : Error Grabbing`);
	}
	await Robot_go(BASE, task.location);
	const dropResult = await Robot_drop(BASE);
	if(!dropResult){
		return LOG(`${task.positionStyled} : Error Dropping`);
	}

	return await trigFinish();
}


const CHECK_STATUS = new Enum(['NO_GO', 'GOOD_COLOR', 'EMPTY', 'WRONG_COLOR']);
const whatsAtDropArea = async(BASE, task)=>{
	await Robot_go(BASE, task.location);
	
	const justCapturedPills = await Camera_capture(BASE);
	const pill = justCapturedPills.getByLocation(task.location);

	if(BASE.robot.hoverDangerousPlace){
		return CHECK_STATUS.NO_GO;
	}else if(pill === undefined){
		return CHECK_STATUS.EMPTY;
	}else if(pill.color.name !== task.color.name){
		return CHECK_STATUS.WRONG_COLOR;
	}else{
		return CHECK_STATUS.GOOD_COLOR;			
	}
}

const findFreePillByColorName = async(BASE, LOG, colorName, depth=0)=>{
	BASE.robot.colorName = `${colorName}`;
	if(depth>10){
		LOG(`Unlock all ${Color.style(colorName)} pill`);
		Memory_get(BASE, [colorName]).map(pill=>pill.unlock());
	}
	const pills = Memory_get(BASE, [colorName]);
	const freePills = pills.filter(pill=>!pill.isLocked);
	if(freePills.length == 0){
		LOG(`Explore to find free pill`);
		await Robot_go(BASE, BASE.grid.getRandomCellLocation());
		await Camera_capture(BASE);
		return await findFreePillByColorName(BASE, LOG, colorName, depth+1)
	}else{
		const pillInMemory = freePills.toArray()[Math.floor(Math.random()*freePills.length)];
		await Robot_go(BASE, pillInMemory.location);
		const justCapturedPills = await Camera_capture(BASE);
		const pill = justCapturedPills.getByLocation(pillInMemory);
		if(!!pill && pill.color.name == pillInMemory.color.name){
			LOG(`Find ${pill.colorStyled} @ ${pill.positionStyled}`);
			return pillInMemory;
		}else{
			//>>> SOMETHING GO WRONG HERE
			LOG(`My souvenir is wrong... going deeper for ${Color.style(pill?.color.name)}`);
			BASE.memory.delete(pillInMemory);
			return await findFreePillByColorName(BASE, LOG, colorName, depth+1)
		}
	}
}
