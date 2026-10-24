import {Robot_go} from "./../../Robot";
import {Command_getPath} from "./../../Command";
import { Vector4 } from './../../../tools/Vector.js';
import { createNoise2D } from 'simplex-noise';

export const Move_drawer = async (BASE)=>{
	const path = await Command_getPath(BASE);
	const noise2D = createNoise2D();

	await Robot_go(BASE, new Vector4(...(path[0]), 0, 0));
	await Promise.all(path.map((point)=>{
		const n = noise2D(point.x*0.01, point.y*0.01);
		return Robot_go(BASE, new Vector4(...point, (n * 0.5 + 0.5)* -300, n*40));
	}));

	await Robot_go(BASE, new Vector4(...(path[path.length-1]), 0, 0));

	return true;
}
