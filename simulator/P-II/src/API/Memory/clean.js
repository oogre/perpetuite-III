import {Memory_get} from "./get.js";


export const Memory_clean = ({memory}, location)=>{
	const cleanArea = Memory_get({memory}, location);
	if(cleanArea!==undefined){
		return memory.delete(cleanArea);
	}
	return true;
}
