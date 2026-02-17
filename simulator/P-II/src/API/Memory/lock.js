import {Memory_get} from "./get.js";


export const Memory_lock = ({memory}, location)=>{
	const pill = Memory_get({memory}, location);
	if(pill){
		pill.lock();
	}
}


export const Memory_unlock = ({memory}, colorName)=>{
	const pills = Memory_get({memory}, colorName);
	pills.map(pill=>pill.unlock())
}