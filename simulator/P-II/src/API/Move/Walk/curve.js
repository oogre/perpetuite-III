import {Robot_go} from "./../../Robot";
import { Vector4, Vector3 } from './../../../tools/Vector.js';
import { lerp, inverseLerp, areAligned} from './../../../tools/math.js';
import ArcThrough from './../../../tools/ArcThrough.js';

// Move curve 0 0 0 0

//   const arc = new ArcThrough(origin, middle, destination);
//   arc.getPoints(32)         // 33 Vector3, de l'origine à la destination, régulièrement répartis en angle (donc en longueur : c'est un cercle)
//   arc.getLength()           // longueur de l'arc



export const Move_curve = async (BASE, destination=BASE.robot.location4D)=>{
	const getNotAlignedPoint = (A, B)=>{
		const C = new Vector3(...BASE.grid.getRandom().location);
		C.z = Math.max((A.z+B.z)/2, BASE.table.toFloorLocation(C).z);
		if(areAligned(start, C, stop))
			return findNotAlignedPoint();
		return C;
	}
	const start = BASE.robot.location3D;
	const stop = new Vector3(...destination);
	const middle = getNotAlignedPoint(start, stop);

	const arc = new ArcThrough(start, middle, stop);

	console.log(arc.getLength());
	console.log(arc.getPoints(10));

	// const work = new Vector3(...BASE.grid.getRandom().location, 0, 0);
	
	// const lastPoint = path[path.length-1];
	// const curve = Math.ceil(Math.random() * 4);
	// await Promise.all([path.map((point)=>{
	// 	return Robot_go(BASE, new Vector4(...point, 0));
	// }));

	// await Robot_go(BASE, new Vector4(...destination));
	return true;
}

