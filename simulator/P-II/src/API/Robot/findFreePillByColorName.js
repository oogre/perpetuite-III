
import {Robot_go} from './go.js';
import {Robot_explore} from './explore.js';
import {Camera_capture} from './../Camera';
import {Memory_get} from './../Memory';
import PillModel from "./../../Pills/PillModel";


export const Robot_findFreePillByColorName = async(BASE, colorName, depth=0)=>{
	if(depth>10){
		console.log(`Unlock all ${Color.style(colorName)} pill`);
		Memory_get(BASE, [colorName]).map(pill=>pill.unlock());
	}
	const pills = Memory_get(BASE, [colorName]);
	const freePills = pills.filter(pill=>!pill.isLocked);
	if(freePills.length>0){
		const pillInMemory = freePills.toArray()[Math.floor(Math.random()*freePills.length)];
		await Robot_go(BASE, pillInMemory.location);
		const justCapturedPills = await Camera_capture(BASE);
		const pill = justCapturedPills.getByLocation(pillInMemory);
		if(!pill || pill.color.name != pillInMemory.color.name){
			console.log(`My souvenir is wrong... going deeper for ${PillModel.Color.style(pill?.color.name)}`);
			BASE.memory.delete(pillInMemory);
			return await Robot_findFreePillByColorName(BASE, colorName, depth+1)
		}
		return pillInMemory;
	}
	console.log(`Explore to find free pill`);
	await Robot_explore(BASE);
	return await Robot_findFreePillByColorName(BASE, colorName, depth+1)
	
}