
import {Robot_go} from "./../../Robot";
import {lerp} from "./../../../tools/math.js";

// Move doupt
export const Move_doupt = async (BASE)=>{
	const ptLen = Math.floor(lerp(3, 6, Math.random()));
	const origin = BASE.robot.location4D;
	const work = origin.clone()
	for(let i = 0 ; i < ptLen ; i++){
		const amp = lerp(0, 40, Math.random());
		work.w = lerp(-amp, amp, Math.random());
		await Robot_go(BASE, work, {enableDamping:false, curve:false});
	}
	return Robot_go(BASE, origin, {enableDamping:false, curve:false})
}
