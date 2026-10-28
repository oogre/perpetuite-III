
import { Robot_travelPath, Robot_go } from "./../../Robot";
import { Vector3, Vector4, Vector2 } from './../../../tools/Vector.js';
import { inverseLerp, lerp } from './../../../tools/math.js';

//Move mechanicalSheep
export const Move_mechanicalSheep = async (BASE)=>{
	let path = [];
	const origin = BASE.robot.location4D;
	const origin3D = BASE.robot.location3D;
	const start = new Vector3(origin.x, origin.y, 0);
	start.setLength(BASE.robot.conf.radius);

	

	const [center, r] = [new Vector3(0, 0, 0), BASE.robot.conf.radius];
	const ptLen = 12;
	const _ptLen = 1/ptLen;
	const offAlpha = new Vector2(...start).angle(); 

	path = path.concat(
		new Array(ptLen+1)
			.fill(0)
			.map( (_, k) => new Vector3(
					center.x + r * Math.cos(offAlpha +  Math.PI * 2 * k * _ptLen ),
					center.y + r * Math.sin(offAlpha +  Math.PI * 2 * k * _ptLen ),
					0 )
			)
	);

	path = path.map((point, k) => {
		point.z = lerp(BASE.table.toFloorLocation(point).z + 100, 0, k%2==0)
		return point;
	});
	
	await Robot_go(BASE, start);

	await Robot_travelPath(BASE, [
		...path.map((point, id, {length})=>{
			return new Vector4(...point, 0);
		}),
		
	]);
	await Robot_go(BASE, origin);

	return true;
}