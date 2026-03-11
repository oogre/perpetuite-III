
import { Robot_go } from "./../Robot";
import { Vector3, Vector4, Vector2 } from './../../tools/Vector.js';
import { inverseLerp, lerp } from './../../tools/math.js';


export const Move_mechanicalSheep = async (BASE)=>{
	let path = [];
	const origin = BASE.robot.location4D;
	const origin3D = BASE.robot.location3D;
	const work = new Vector3(origin.x, origin.y, 0);
	work.setLength(BASE.robot.conf.radius);

	const dist = new Vector3(...work).sub(origin3D).length()
	const len = Math.floor(lerp(0, 12, inverseLerp(0, 600, dist)));
	const _len = 1/len;
	path = path.concat(
		new Array(len)
			.fill(0)
			.map( (_, k) => new Vector3().lerpVectors(origin3D, work, (k+1) * _len) )
	);
	const [center, r] = [new Vector3(0, 0, 0), BASE.robot.conf.radius];
	const ptLen = 12;
	const _ptLen = 1/ptLen;
	const offAlpha = new Vector2(...work).angle(); 

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
		const {z:altitude} = BASE.table.toFloorLocation(point);
		point.z = lerp(altitude, 0, k%2==0)
		return point;
	});

	console.log(path);

	return true;
}