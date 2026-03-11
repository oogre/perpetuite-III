
import {Robot_go} from "./../Robot";
import {lerp} from "./../../tools/math.js";

//Log.info("Random w adjustment");
export const Move_doupt = async ({robot})=>{
	const ptLen = Math.floor(lerp(2, 5, Math.random()));
	const origin = robot.location4D;
	const work = origin.clone()
	for(let i = 0 ; i < ptLen ; i++){
		const amp = lerp(10, 40, Math.random());
		work.w = lerp(-amp, amp, Math.random());
		await Robot_go({robot}, work);
	}
	return Robot_go({robot}, origin)
}
