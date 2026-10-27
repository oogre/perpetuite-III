import {Robot_roll, Robot_go} from "./../../Robot";
import {lerp} from "./../../../tools/math.js";

// Move boogie
export const Move_boogie = async (BASE)=>{
	const ptLen = Math.floor(lerp(3, 6, Math.random()));
	const origin = BASE.robot.location4D;
	const work = origin.clone()
	for(let i = 0 ; i < ptLen ; i++){
		const amp = lerp(10, 50, Math.random());
		work.x = origin.x + lerp(-amp, amp, Math.random());
		work.y = origin.y + lerp(-amp, amp, Math.random());
		work.z = origin.z + lerp(-amp, 0, Math.random());
		work.w = origin.w + lerp(-amp, amp, Math.random());
		await Robot_go(BASE, work, {enableDamping:false, curve:false});
	}
	await Robot_go(BASE, origin, {enableDamping:false, curve:false});
	return true;
}
