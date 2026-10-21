
import { Vector2, Vector4 } from './../../tools/Vector.js';

export const Robot_limitter = (BASE, location)=>{
	const target = new Vector4(...location);
	const horizontalTarget = new Vector2(...target);
	const r = BASE.robot.conf.radius - 30;
	if(horizontalTarget.lengthSq() > r * r){
		horizontalTarget.setLength(r);
	}

	target.x = horizontalTarget.x;
	target.y = horizontalTarget.y;
	target.z = Math.min(BASE.robot.conf.maxZ, Math.max(BASE.table.toFloorLocation(horizontalTarget).z + BASE.memory.conf.depth, target.z));
	target.w = Math.min(BASE.robot.conf.maxRoll, Math.max(BASE.robot.conf.minRoll, target.w % 360));
	return target;
}

