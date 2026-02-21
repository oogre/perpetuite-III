

import {Robot_roll, Robot_go} from "./../Robot";
import {lerp} from "./../../tools/math.js";

//Log.info("Random z adjustment");
export const Move_zCalibration = async ({robot})=>{
	const ptLen = Math.floor(lerp(2, 5, Math.random()));
	const origin = robot._location.clone()
	for(let i = 0 ; i < ptLen ; i++){
		const amp = lerp(10, 40, Math.random());
		const z = origin.z + lerp(-amp, 0, Math.random());
		await Robot_go({robot}, [origin.x, origin.y, z]);
	}
	await Robot_go({robot}, origin);
	return true;
}