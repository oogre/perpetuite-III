import {Robot_go, Robot_travelPath} from "./../../Robot";
import {Command_getPath} from "./../../Command";
import { Vector4 } from './../../../tools/Vector.js';
import { lerp, inverseLerp} from './../../../tools/math.js';

//Move drawer
//Command getPath
export const Move_drawer = async (BASE)=>{
	const path = await Command_getPath(BASE);
	const ptLen = Math.floor(lerp(2, 4, Math.random()));
	if(path.length === 0){
		console.log("Move drawer : aucun tracé à dessiner");
		return true;
	}
	for(let i = 0 ; i < ptLen ; i++){
		const lastPoint = path[path.length-1];
		const curve = Math.ceil(Math.random() * 4);
		await Robot_travelPath(BASE, [
			...path.map((point, id, {length})=>{
				const l = inverseLerp(4, 10, length);
				const depth = lerp(0, -200, l, true);
				const n = 1 - Math.abs(Math.pow((id / (length -1)) * 2 - 1, curve));
				return new Vector4(...point, lerp(0, depth, n), 0);
			}),
			new Vector4(...lastPoint, 0, 0)
		]);
	}
	return true;
}
