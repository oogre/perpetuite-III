import {Robot_roll, Robot_go} from "./../Robot";
import {lerp} from "./../../tools/math.js";

//Log.info("Random x y z w adjustment");
export const Move_boogie = async ({robot})=>{
	const ptLen = Math.floor(lerp(2, 5, Math.random()));
	const origin = robot.location4D;
	const work = origin.clone()
	for(let i = 0 ; i < ptLen ; i++){
		const amp = lerp(10, 40, Math.random());
		work.x = origin.x + lerp(-amp, amp, Math.random());
		work.y = origin.y + lerp(-amp, amp, Math.random());
		work.z = origin.z + lerp(-amp, 0, Math.random());
		work.w = origin.w + lerp(-amp, amp, Math.random());
		await Robot_go({robot}, work);
	}
	await Robot_go({robot}, origin);
	return true;
}
