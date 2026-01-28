
import {isLocation, isBox, isString} from "./../../tools/validators.js";
import { Vector3 } from 'vecteur/3d';

export const Memory_get = ({robot, camera, memory}, location)=>{
	if(isLocation(location)){
		return memory.getByLocation(new Vector3(...location));
	}
	if(isBox(location)){
		return memory.getByBox(location);
	}
	if(isString(...location)){
		return memory.getByColorName(...location);
	}
	return memory.set.map(pill=>pill.toString()).join("\n")
}
