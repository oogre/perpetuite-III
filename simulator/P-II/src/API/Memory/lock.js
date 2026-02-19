import {Memory_get} from "./get.js";
import {isLocation, isBox, isString} from "./../../tools/validators.js";
import {delay} from "./../../tools/helpers.js";


export const Memory_lock = async ({memory}, location)=>{
	if(isLocation(location)){
		const pill = Memory_get({memory}, location);
		if(pill){
			pill.lock();
		}
	}else{
		for(const pill of memory.set.toArray()){
			await delay(Math.random()*50);
			pill.lock();
		}
	}
}


export const Memory_unlock = ({memory}, colorName)=>{
	const pills = Memory_get({memory}, colorName);

	const coloredPillHistory = pills.toArray()
								.filter(({isLock})=>isLock)
								.sort((pillA, pillB)=>{
									return pillA.lockedAt - pillB.lockedAt;
								});
	coloredPillHistory.length = Math.floor(coloredPillHistory.length/3);
	coloredPillHistory.map(pill=>pill.unlock());
}