
import {Robot_go} from "./../../Robot";
import { Vector4 } from './../../../tools/Vector.js';

//Move inspector

export const Move_inspector = async (BASE, destination=BASE.robot.location4D)=>{
	await Promise.all([...BASE.data.history.tasks.map(({color, location})=>{
				const work = new Vector4(...location, 0, 0);
				work.z = (BASE.table.toFloorLocation(work).z + 20);
				work.w = lerp(BASE.robot.conf.minRoll, BASE.robot.conf.maxRoll, Math.random());

				return Robot_go(BASE, work, false);
			}), Robot_go(BASE, new Vector4(...destination)) 
	]);
	return true;
}