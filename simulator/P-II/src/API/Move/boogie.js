import {Robot_roll, Robot_go} from "./../Robot";
import {lerp} from "./../../tools/math.js";

//Log.info("Random x y z w adjustment");
export const Move_boogie = async ({robot})=>{
	const ptLen = Math.floor(lerp(2, 5, Math.random()));
	const origin = robot._location.clone()
	for(let i = 0 ; i < ptLen ; i++){
		const amp = lerp(10, 40, Math.random());
		const angle = lerp(-amp, amp, Math.random());
		const x = origin.x + lerp(-amp, amp, Math.random());
		const y = origin.y + lerp(-amp, amp, Math.random());
		const z = origin.z + lerp(-amp, 0, Math.random());
		await Promise.race([Robot_go({robot}, [x, y, z]), Robot_roll({robot}, [angle])]);
	}
	await Promise.race([Robot_go({robot}, origin), Robot_roll({robot}, [0])]);
	return true;
}
