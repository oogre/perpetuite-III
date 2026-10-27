import {Robot_go} from "./../../Robot";
import { Vector4 } from './../../../tools/Vector.js';
import {lerp} from "./../../../tools/math.js";
import {delay} from './../../../tools/helpers.js';

//Log.info("Random x y z w adjustment");
export const Move_drunk = async (BASE, destination=BASE.robot.location4D)=>{
	BASE.robot.actionDesc = `Move drunk ${destination}`;

	const ptLen = Math.floor(lerp(3, 10, Math.random()));
	const origin = BASE.robot.location4D;
	for(let i = 0 ; i < ptLen ; i++){
		const work = new Vector4(...BASE.grid.getRandom().location, 0, 0);
		work.z = Math.random() * (BASE.table.toFloorLocation(work).z + 20);
		work.w = lerp(BASE.robot.conf.minRoll, BASE.robot.conf.maxRoll, Math.random());
		await Robot_go(BASE, work, {enableDamping:false, curve=true});
	}
	await delay( 1000 );
	await Robot_go(BASE, new Vector4(...destination));
	BASE.robot.actionDescPop();
	return true;
}
