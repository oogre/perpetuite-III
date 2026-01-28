import { Vector3 } from 'vecteur/3d';
import {isLocation, isBox, isString} from "./../tools/validators.js";
import {delay, nTry, spacedLog} from "./../tools/helpers.js";
import Pills, {PillModel} from "./../Pills";
import Enum from 'enum';


export const Robot_go = async ({robot}, location)=>{
	await robot.go(new Vector3(...location));
	return true;
}

export const Robot_grab = async ({robot, real, memory, camera, image, forbidden})=>{
	if(robot.grabbedPill!==null){
		console.log("Already grabbing");
		return false;
	}
	const beforeCollection = await Camera_capture({robot, camera, memory, image, forbidden}, true)
	
	const pillSouvenir = memory.pills.getByLocation(robot._location);
	const isPillSouvenirExists = pillSouvenir!==undefined;
	const targetedPill = beforeCollection.getByLocation(robot._location);
	const isTargetedPillExists = targetedPill!==undefined;
	
	if(isPillSouvenirExists){
		memory.pills.delete(pillSouvenir);	
	}else{
		console.log(pillSouvenir, "NOT DELETED")
	}
	
	if(isTargetedPillExists){
		await Robot_go({robot}, targetedPill.location);
	}else{
		console.log("pill Is not Present")
		return false;
	}
	
	await real.delete(targetedPill);
	
	const afterCollection = await Camera_capture({robot, camera, memory, image, forbidden}, true)
	const isRemoved = afterCollection.get(targetedPill) === null;
	if(!isRemoved){
		console.log("pill Is not Removed");
		return false;
	}

	robot.grabbedPill = targetedPill;
	return true;
}

export const Robot_drop = async ({robot, real, memory, camera, image, forbidden})=>{
	if(robot.grabbedPill===null){
		console.log("Nothing to drop");
		return false;
	}
	const cleanArea = memory.pills.getByLocation(robot._location);
	const isCleanArea = cleanArea===undefined;
	if(!isCleanArea){
		memory.pills.delete(cleanArea);
	}
	await Camera_capture({robot, camera, memory, image, forbidden}, true)
	
	const targetedArea = memory.pills.getByLocation(robot._location);
	const isTargetedAreaEmpty = targetedArea===undefined;
	if(!isTargetedAreaEmpty){
		console.log("DropZone is occupied");
		return false;	
	}
	robot.grabbedPill.location = robot._location;
	real.pills.add(robot.grabbedPill);
	memory.pills.add(robot.grabbedPill);
	robot.grabbedPill = null;
	return true;
}

export const Camera_capture = async ({robot, camera, memory, image, forbidden}, hasToSaveInMemory = false)=>{
	const captureName = `${robot.position} ${new Date().getTime()}.png`;
	const localPills = new Pills(memory.conf);
	const rawData = await camera.capture(captureName);

	await image.transportImageFromSourceToDest();	
	const data = rawData.map(data=>localPills.createPill(data));
	const [ pills, notPills] = data.reduce((acc, item)=>{
		const isPill = localPills.isRound(item) && localPills.isLargeLikeAPIll(item);
		const id = +isPill;
		acc[id].push(item);
		return acc
	}, [[], []]);



	forbidden.addEach(notPills);

	
	localPills.addEach(pills);
	if(hasToSaveInMemory){
		// const pills = memory.pills.getByBox([robot._location.x, robot._location.y, 100, 100]);
		// memory.pills.deleteEach(pills);
		memory.pills.addEach(data);	
	}
	return localPills;
}

export const Memory_get = ({robot, camera, memory}, location)=>{
	if(isLocation(location)){
		return memory.pills.getByLocation(new Vector3(...location));
	}
	if(isBox(location)){
		return memory.pills.getByBox(location);
	}
	if(isString(...location)){
		return memory.pills.getByColorName(...location);
	}
	return memory.pills.map(pill=>pill.toString()).join("\n")
}

let hasToLoop = false;

export const Robot_loop = async (BASE)=>{
	const nexTask = await BASE.cmd.getTask();
	hasToLoop = true;
	loop(BASE, nexTask);
}

export const Robot_stop = ({})=>{
	hasToLoop = false;
}

export const loop = async(BASE, task, targetPill=null, depth=1)=>{
	if(targetPill === null && !hasToLoop)return;// BREAK LOOP

	const CHECK_STATUS = new Enum(['GOOD_COLOR', 'EMPTY', 'WRONG_COLOR']);
	const LOG = spacedLog(depth, ">");

	LOG(`Pattern complete in ${BASE.cmd.length} task`)
	LOG(`Put ${task.color.name} @ ${task.location.x.toFixed(2)} ${task.location.y.toFixed(2)}`);

	const whatsAtDropArea = async(task)=>{
		await Robot_go(BASE, task.location);
		
		await Camera_capture(BASE, true);
		const result = await Memory_get(BASE, task.location);

		// const justCaptured = await Camera_capture(BASE, true);
		// const result = justCaptured.getByLocation(new Vector3(task.location));

		if(result === undefined){
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
			BASE.memory.pills.getByColorName(colorName).map(pill=>pill.unlock());
		}
		const pills = BASE.memory.pills.getByColorName(colorName);
		const freePills = pills.filter(pill=>!pill.isLocked);
		if(freePills.length == 0){
			LOG(`Explore to find free pill`);
			await Robot_go(BASE, BASE.grid.getRandomCellLocation());
			await Camera_capture(BASE, true);
			return await findFreePillByColorName(colorName, depth+1)
		}else{
			const pillInMemory = freePills.getRandom();//.one()
			await Robot_go(BASE, pillInMemory.location);
			const justCapturedPills = await Camera_capture(BASE, true);
			const pill = justCapturedPills.getByLocation(pillInMemory.location);
			if(!!pill && pill.color.name == pillInMemory.color.name){
				LOG(`Find @ ${pillInMemory.location.x.toFixed(2)} ${pillInMemory.location.y.toFixed(2)}`);
				return pillInMemory;
			}else{
				//>>> SOMETHING GO WRONG HERE
				LOG(`My souvenir is wrong... going deeper for ${pill?.color.name}`);
				BASE.memory.pills.delete(pillInMemory);
				return await findFreePillByColorName(colorName, depth+1)
			}
		}
	}
	const final = async()=>{
		LOG(`Done`);
		const nPill = BASE.memory.pills.getByLocation(task.location);
		nPill.lock();
		if(targetPill===null){
			const nexTask = await BASE.cmd.getTask();
			return loop(BASE, nexTask);	
		}
		return;
	}

	LOG(`Check @ ${task.location.x.toFixed(2)} ${task.location.y.toFixed(2)}`);

	switch(await whatsAtDropArea(task)){
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

export const Image_transfert = async ({image})=>{
	await image.transportImageFromSourceToDest();	
	return true;
}
export const Image_start = async ({image})=>{
	await image.start();	
	return true;
}
export const Image_stop = async ({image})=>{
	await image.stop();	
	return true;
}

