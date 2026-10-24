import {Robot_go} from "./../../Robot";
import {Command_getPath} from "./../../Command";
import { Vector4 } from './../../../tools/Vector.js';


export const Move_drawer = async (BASE)=>{
	const path = await Command_getPath(BASE);

	await Robot_go(BASE, new Vector4(...(path[0]), -200, 0));
	await Promise.all(path.map(point=>{
		return Robot_go(BASE, new Vector4(...point, -200, 0));
	}));
	
	return true;
}
