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
		const n = (id / (length -1)) * 2 - 1;
		const m = Math.pow(n, 2);
		console.log(m * -200, n * 40);
		
		return Robot_go(BASE, new Vector4(...point, m * -200, n * 40));
	}));

	return true;
}
