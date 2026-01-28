import Enum from 'enum';

import {Robot_go} from './go.js';
import {Robot_grab} from './grab.js';
import {Robot_drop} from './drop.js';
import {Camera_capture} from './../Camera';
import {Memory_get} from './../Memory';
import {nTry, spacedLog} from "./../../tools/helpers.js";


let hasToLoop = false;

export const Robot_loop = async (BASE)=>{
	const nexTask = await BASE.cmd.getTask();
	hasToLoop = true;
	loop(BASE, nexTask);
}

export const Robot_stop = ({})=>{
	hasToLoop = false;
}

const loop = async(BASE, task, targetPill=null, depth=1)=>{
	if(targetPill === null && !hasToLoop)return;// BREAK LOOP

	const CHECK_STATUS = new Enum(['NO_GO', 'GOOD_COLOR', 'EMPTY', 'WRONG_COLOR']);
	const LOG = spacedLog(depth, ">");

	LOG(`Pattern complete in ${BASE.cmd.length} task`)
	LOG(`Put ${task.color.name} @ ${task.location.x.toFixed(2)} ${task.location.y.toFixed(2)}`);

	const whatsAtDropArea = async(task)=>{
		await Robot_go(BASE, task.location);
		
		await Camera_capture(BASE, true);
		const result = await Memory_get(BASE, task.location);

		// const justCaptured = await Camera_capture(BASE, true);
		// const result = justCaptured.getByLocation(new Vector3(task.location));
		if(BASE.robot.hoverDangerousPlace){
			return CHECK_STATUS.NO_GO;
		}else if(result === undefined){
			return CHECK_STATUS.EMPTY;
		}else if(result.color.name !== task.color.name){
			return CHECK_STATUS.WRONG_COLOR;
		}else{
			return CHECK_STATUS.GOOD_COLOR;			
		}
	}
	const findFreePillByColorName = async(colorName, depth=0)=>{
		LOG(`Looking for ${colorName}`);

		BASE.robot.colorName = `${colorName}`;
		if(depth>10){
			LOG(`Unlock all ${colorName} pill`);
			Memory_get(BASE, [colorName]).map(pill=>pill.unlock());
		}
		const pills = Memory_get(BASE, [colorName]);
		const freePills = pills.filter(pill=>!pill.isLocked);
		if(freePills.length == 0){
			LOG(`Explore to find free pill`);
			await Robot_go(BASE, BASE.grid.getRandomCellLocation());
			await Camera_capture(BASE, true);
			return await findFreePillByColorName(colorName, depth+1)
		}else{
			const pillInMemory = freePills.toArray()[Math.floor(Math.random()*freePills.length)];
			await Robot_go(BASE, pillInMemory.location);
			const justCapturedPills = await Camera_capture(BASE, true);
			const pill = justCapturedPills.getByLocation(pillInMemory);
			if(!!pill && pill.color.name == pillInMemory.color.name){
				LOG(`Find @ ${pillInMemory.location.x.toFixed(2)} ${pillInMemory.location.y.toFixed(2)}`);
				return pillInMemory;
			}else{
				//>>> SOMETHING GO WRONG HERE
				LOG(`My souvenir is wrong... going deeper for ${pill?.color.name}`);
				BASE.memory.delete(pillInMemory);
				return await findFreePillByColorName(colorName, depth+1)
			}
		}
	}
	const final = async()=>{
		LOG(`Done`);
		const nPill = BASE.memory.getByLocation(task.location);
		nPill.lock();
		if(targetPill===null){
			const nexTask = await BASE.cmd.getTask();
			return loop(BASE, nexTask);	
		}
		return;
	}

	LOG(`Check @ ${task.location.x.toFixed(2)} ${task.location.y.toFixed(2)}`);

	switch(await whatsAtDropArea(task)){
		case CHECK_STATUS.NO_GO :
			LOG(`NO GO AREA`);
		case CHECK_STATUS.GOOD_COLOR : 
			LOG(`Found : ${task.color.name}`);
			if(targetPill===null){
				return await final();
			}else{
				LOG(`But fallback on WRONG_COLOR`);
			}
		case CHECK_STATUS.WRONG_COLOR:
			const pill = await Memory_get(BASE, task.location);
			LOG(`Found : ${pill.color.name}`);
			const subTask = await BASE.cmd.getTask(pill.color.name);
			await loop(BASE, subTask, pill, depth+1);
		break;
	}

	LOG(`Found : Empty`);
	const pill = targetPill || await findFreePillByColorName(task.color.name);
	await Robot_go(BASE, pill.location);

	const grabResult = await nTry(5, async(tryCount)=>await Robot_grab(BASE));
	if(!grabResult){
		return console.log("Error Grabbing");
	}
	await Robot_go(BASE, task.location);
	const dropResult = await Robot_drop(BASE);
	if(!dropResult){
		return console.log("Error Dropping");
	}

	return await final();
}

