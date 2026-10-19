
import {Memory_get} from "./get.js";



export const Memory_delete = ({memory, robot})=>{
	const cleanArea = Memory_get({memory}, robot.location2D);
	if(cleanArea!==undefined){
		return memory.delete(cleanArea);
	}
	return true;
}
