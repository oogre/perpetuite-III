import {Robot_go, Robot_travelPath} from "./../../Robot";
import { Vector4, Vector3 } from './../../../tools/Vector.js';
import { lerp, inverseLerp, areAligned} from './../../../tools/math.js';
import ArcThrough from './../../../tools/ArcThrough.js';

// Move curve 0 0 0 0
// Move curve 260 -436 0 0
//   const arc = new ArcThrough(origin, middle, destination);
//   arc.getPoints(32)         // 33 Vector3, de l'origine à la destination, régulièrement répartis en angle (donc en longueur : c'est un cercle)
//   arc.getLength()           // longueur de l'arc

export const Move_curve = async (BASE, destination=BASE.robot.location4D)=>{
	const getNotAlignedPoint = (A, B)=>{
		const C = new Vector3(...BASE.grid.getRandom().location);
		C.z = Math.max((A.z+B.z)/2, BASE.table.toFloorLocation(C).z);
		if(areAligned(start, C, stop))
			return getNotAlignedPoint(A, B);
		return C;
	}
	const start = BASE.robot.location3D;
	const stop = new Vector3(...destination);

	if(new Vector3().subVectors(start, stop).length()>10){
		stop.z = Math.max(stop.z, BASE.table.toFloorLocation(stop).z);
		const middle = getNotAlignedPoint(start, stop);

		const arc = new ArcThrough(start, middle, stop, {shortest : true});
		await Robot_travelPath(BASE, [
			...arc.getPoints(5).map((pt, id, {length})=>{
				const point = new Vector4(...pt, 0);
				if(id > 0 && id < length - 1){
					point.z = Math.min(0, Math.max(point.z, BASE.table.toFloorLocation(point).z + 20));
				}
				return point;
			})
		]);
		
	}
	await Robot_go(BASE, new Vector4(...destination), {enableDamping:true, curve:false});
	return true;
}

