
import { Vector2 } from './../../tools/Vector.js';

export const Robot_limitter = (BASE, location)=>{
	const horizontalTarget = new Vector2(...location);
	if(horizontalTarget.lengthSq() > BASE.robot.conf.radius * BASE.robot.conf.radius){
		horizontalTarget.setLength(BASE.robot.conf.radius);
	}
	location.x = horizontalTarget.x;
	location.y = horizontalTarget.y;
	location.z = Math.min(BASE.robot.conf.maxZ, Math.max(BASE.table.toFloorLocation(location).z, location.z));
	location.w = Math.min(BASE.robot.conf.maxRoll, Math.max(BASE.robot.conf.minRoll, location.w % 360));
	return location;
}

