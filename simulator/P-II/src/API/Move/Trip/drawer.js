import {Robot_go} from "./../../Robot";
import {Command_getPath} from "./../../Command";
import { Vector4 } from './../../../tools/Vector.js';
import { lerp, inverseLerp} from './../../../tools/math.js';
import { createNoise2D } from 'simplex-noise';

export const Move_drawer = async (BASE)=>{
	const path = await Command_getPath(BASE);
	const noise2D = createNoise2D();

	const lastPoint = path[path.length-1];
	const curve = Math.ceil(Math.random() * 4);
	await Promise.all([...path.map((point, id, {length})=>{
			const l = inverseLerp(4, 10, length);
			const depth = lerp(0, -200, l, true);
			const n = 1 - Math.abs(Math.pow((id / (length -1)) * 2 - 1, curve));
			return Robot_go(BASE, new Vector4(...point, lerp(0, depth, n), 0));
		}), Robot_go(BASE, new Vector4(...lastPoint, 0, 0)) ]);
	return true;
}
