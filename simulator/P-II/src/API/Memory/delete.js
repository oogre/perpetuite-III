
import {Memory_get} from "./get.js";



export const Memory_delete = ({memory, robot})=>{
	const cleanArea = Memory_get({memory}, robot._location);
	if(cleanArea!==undefined){
		return memory.delete(cleanArea);
	}
	return true;
}
