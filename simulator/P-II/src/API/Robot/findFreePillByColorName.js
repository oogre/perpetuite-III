
import {Robot_go} from './go.js';
import {Robot_explore} from './explore.js';
import {Memory_get, Memory_unlock} from './../Memory';
import {Robot_whatsBelow, AT_DROPZONE} from './whatsBelow.js';
import PillModel from "./../../Pills/PillModel";
import { Vector2 } from './../../tools/Vector.js';


export const Robot_findFreePillByColorName = async(BASE, colorName, depth=0)=>{
	if(depth>2){
		throw new Error("Unlock loop");
	}
	else if(depth==2){
		await Robot_explore(BASE);
	}
	else if(depth>0){
		console.log(`Unlock all ${PillModel.Color.style(colorName)} pill`);
		Memory_unlock(BASE, [colorName]);
	}
	
	const coloredPills = Memory_get(BASE, [colorName]);
	const unlockColoredPills = coloredPills.filter(pill=>!pill.isLock);
	if(unlockColoredPills.length>0){
		const toolVec = new Vector2();
		const robotLocation = BASE.robot.location2D;
		const distToRobot = (pill)=>{
			return toolVec.subVectors(pill.location, robotLocation).lengthSq();
		}
		const unlockColoredPillsStortedByDistance = unlockColoredPills.toArray()
			.sort((a, b)=> distToRobot(a) - distToRobot(b));
		const id = Math.floor(Math.pow(Math.random(), 10) * unlockColoredPillsStortedByDistance.length);
		const selectedPill = unlockColoredPillsStortedByDistance[id];

		await Robot_go(BASE, selectedPill.location);

		const below = await Robot_whatsBelow(BASE, selectedPill.color.name);
		if(below == AT_DROPZONE.GOOD_COLOR) {
			return selectedPill;
		}
		console.log(`My souvenir is ${selectedPill.color.style} actual pill color is not... going deeper`);
		BASE.memory.delete(selectedPill);
	}
	return await Robot_findFreePillByColorName(BASE, colorName, depth+1)
}