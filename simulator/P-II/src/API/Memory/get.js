
import {isLocation, isBox, isString} from "./../../tools/validators.js";
import { Vector4 } from './../../tools/Vector.js';

export const Memory_get = ({memory}, location)=>{
	if(memory.isPill(location)){
		return memory.set.get(location);
	}
	else if(isLocation(location)){
		return memory.getByLocation(new Vector4(...location));
	}
	if(isBox(location)){
		return memory.getByBox(location);
	}
	if(isString(...location)){
		return memory.getByColorName(...location);
	}
	return memory.set.map(pill=>pill.toString()).join("\n")
}

