import {degToRag} from "./math.js";

export const axisCorrection = (location, flipAxis)=>{
	const offset = location.clone().multiply(flipAxis);
	offset.z = (1266.6/(offset.z+300)); // 4.222px/mm
	offset.w *= degToRag;
	return offset;
}