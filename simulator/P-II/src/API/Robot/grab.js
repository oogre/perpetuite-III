

import {Robot_go} from './go.js';
import {Camera_capture} from './../Camera';


export const Robot_grab = async ({robot, real, memory, camera, image, forbidden})=>{
	if(robot.grabbedPill!==null){
		console.log("Already grabbing");
		return false;
	}
	const beforeCollection = await Camera_capture({robot, camera, memory, image, forbidden}, true)
	
	const pillSouvenir = memory.getByLocation(robot._location);
	const isPillSouvenirExists = pillSouvenir!==undefined;
	const targetedPill = beforeCollection.getByLocation(robot._location);
	const isTargetedPillExists = targetedPill!==undefined;
	
	if(isPillSouvenirExists){
		memory.set.delete(pillSouvenir);	
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
	const isRemoved = afterCollection.set.get(targetedPill) === null;
	if(!isRemoved){
		console.log("pill Is not Removed");
		return false;
	}

	robot.grabbedPill = targetedPill;
	return true;
}
