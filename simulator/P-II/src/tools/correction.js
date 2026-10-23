import {degToRag} from "./math.js";

export const axisCorrection = (location, flipAxis)=>{
	const offset = location.clone().multiply(flipAxis);
	offset.z = (1596.15/(offset.z+300)); // 5.3205px/mm
	offset.w *= degToRag;
	return offset;
}
