
import {Robot_go} from "./../../Robot";
import { Vector4 } from './../../../tools/Vector.js';
import {lerp} from "./../../../tools/math.js";

Move inspector

export const Move_inspector = async (BASE, destination=BASE.robot.location4D)=>{



	for(const {color, location} of BASE.data.history.tasks){
			const work = new Vector4(...location, 0, 0);
			work.z = (BASE.table.toFloorLocation(work).z + 20);
			work.w = lerp(BASE.robot.conf.minRoll, BASE.robot.conf.maxRoll, Math.random());
			await Robot_go(BASE, work, false);
	}
	await Robot_go(BASE, new Vector4(...destination);


	return true;
}