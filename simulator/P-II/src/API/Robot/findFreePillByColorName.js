
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
	
	
	const pills = Memory_get(BASE, [colorName]);
	const freePills = pills.filter(pill=>!pill.isLock);
	if(freePills.length>0){

		const toolVec = new Vector2();
		const pillInMemory = freePills.toArray()
			.sort((a, b)=> toolVec.subVectors(a.location, BASE.robot._location).lengthSq() - toolVec.subVectors(b.location, BASE.robot._location).lengthSq())[0];


		// const pillInMemory = freePills.toArray()[Math.floor(Math.random()*freePills.length)];
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