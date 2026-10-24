import {Robot_go} from "./../../Robot";
import {Command_getPath} from "./../../Command";
import { Vector4 } from './../../../tools/Vector.js';
import { createNoise2D } from 'simplex-noise';

export const Move_drawer = async (BASE)=>{
	const path = await Command_getPath(BASE);
	const noise2D = createNoise2D();

	path.unshift(path[0]);
	path.push(path[path.length-1]);

	
	await Promise.all(path.map((point, id, {length})=>{
		if(id == 0 || id == length-1){
			return Robot_go(BASE, new Vector4(...point, 0, 0));	
		}
		const n = noise2D(id * 0.1, 0) * 0.5 + 0.5;
		const m = noise2D(id * 0.1, 1);
		return Robot_go(BASE, new Vector4(...point, n * -200, m * 40));
	}));

	return true;
}
