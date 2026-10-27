
import {Robot_go} from "./../../Robot";
import { Vector4 } from './../../../tools/Vector.js';
import {lerp} from "./../../../tools/math.js";
import {delay} from './../../../tools/helpers.js';
//Move inspector

export const Move_inspector = async (BASE, destination=BASE.robot.location4D)=>{
	BASE.robot.actionDesc = `Move inspector ${destination}`;

	for(const {color, location} of BASE.data.history.tasks){
			const work = new Vector4(...location, 0, 0);
			work.z = (BASE.table.toFloorLocation(work).z + 20);
			work.w = lerp(BASE.robot.conf.minRoll, BASE.robot.conf.maxRoll, Math.random());
			await Robot_go(BASE, work, {enableDamping:false, curve=true});
			if(Math.random()<0.2){
				for(let i = 0 ; i < 3 ; i++){
					work.w = lerp(BASE.robot.conf.minRoll, BASE.robot.conf.maxRoll, Math.random());
					await Robot_go(BASE, work, {enableDamping:false, curve=true});
				}
			}
			await delay( lerp(100, 800, Math.random()));
	}
	await delay( 800 );
	await Robot_go(BASE, new Vector4(...destination));
	
	BASE.robot.actionDescPop();
	return true;
}