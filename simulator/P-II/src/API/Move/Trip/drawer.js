import {Robot_go} from "./../../Robot";
import {Command_getPath} from "./../../Command";
import { Vector4 } from './../../../tools/Vector.js';
import { createNoise2D } from 'simplex-noise';

export const Move_drawer = async (BASE)=>{
	const path = await Command_getPath(BASE);

	await Robot_go(BASE, new Vector4(...(path[0]), 0, 0));
	await Promise.all(path.map((point)=>{
		console.log(new Vector4(...point, 0, 0));
		return Robot_go(BASE, new Vector4(...point, 0, 0));
	}));
	console.log("Bonjour");
	//await Robot_go(BASE, new Vector4(...(path[path.length-1]), 0, 0));

	return true;
}
