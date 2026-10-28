import {Robot_go} from "./../../Robot";
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

		const results = await Promise.allSettled(
			arc.getPoints(5).map((point, id, {length})=>{
				const point = new Vector4(point..., 0);
				if(id > 0 && id < length - 1){
					point.z = Math.min(0, Math.max(point.z, BASE.table.toFloorLocation(point).z - 20));
				}
				return Robot_go(BASE, point, {enableDamping : false, curve : false});
			})
		);
		// chaque go() interrompt le précédent par "Move interrupted…" : c'est normal, on l'ignore
		console.log(failure);
		const failure = results.find(r =>
			r.status === "rejected" && r.reason?.message !== "Move interrupted by a new target"
		);
		if(failure) throw failure.reason;
	}
	await Robot_go(BASE, new Vector4(...destination), {enableDamping:true, curve:false});
	return true;
}

