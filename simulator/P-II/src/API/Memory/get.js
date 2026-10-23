
import {isLocation, isBox, isString} from "./../../tools/validators.js";
import { Vector2 } from './../../tools/Vector.js';

export const Memory_get = ({memory}, location)=>{
	if(memory.isPill(location)){
		return memory.set.get(location);
	}
	if(isLocation(location)){
		console.log(`Memory_get Location ${location}`)
		return memory.getByLocation(new Vector2(...location));
	}
	if(isBox(location)){
		console.log(`Memory_get Box ${location}`)
		return memory.getByBox(location);
	}
	if(isString(...location)){
		console.log(`Memory_get Color ${location}`)
		return memory.getByColorName(...location);
	}
	console.log(`Memory_get ALL ${location}`)
	return memory.set.map(pill=>pill.toString()).join("\n")
}


export const Memory_list = ({memory}, location)=>{
	return memory.getByBox(location);
}

