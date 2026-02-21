
import {Robot_roll} from "./../Robot";
import {lerp} from "./../../tools/math.js";

//Log.info("Random w adjustment");
export const Move_doupt = async ({robot})=>{
	const ptLen = Math.floor(lerp(2, 5, Math.random()));
	for(let i = 0 ; i < ptLen ; i++){
		const amp = lerp(10, 40, Math.random());
		const angle = lerp(-amp, amp, Math.random());
		await Robot_roll({robot}, [angle])
	}
	return Robot_roll({robot}, [0])
}
