
import {Robot_go} from './go.js';
import {Robot_explore} from './explore.js';
import {Memory_get, Memory_unlock} from './../Memory';
import {Robot_whatsBelow, AT_DROPZONE} from './whatsBelow.js';
import PillModel from "./../../Pills/PillModel";


export const Robot_findFreePillByColorName = async(BASE, colorName, depth=0)=>{
	if(depth>0){
		console.log(`Unlock all ${PillModel.Color.style(colorName)} pill`);
		Memory_unlock(BASE, [colorName]);
	}else if(depth==1){
		await Robot_explore(BASE);
	}

	if(depth>1){
		throw new Error("Unlock loop");
	}
	
	const pills = Memory_get(BASE, [colorName]);
	const freePills = pills.filter(pill=>!pill.isLock);
	if(freePills.length>0){
		const pillInMemory = freePills.toArray()[Math.floor(Math.random()*freePills.length)];
		await Robot_go(BASE, pillInMemory.location);

		const below = await Robot_whatsBelow(BASE, pillInMemory.color.name);
		if(below == AT_DROPZONE.GOOD_COLOR) {
			return pillInMemory;
		}
		console.log(`My souvenir is ${pillInMemory.color.style} actual pill color is not... going deeper`);
		BASE.memory.delete(pillInMemory);
	}
	return await Robot_findFreePillByColorName(BASE, colorName, depth+1)
}