import {degToRag} from "./math.js";

export const axisCorrection = (location, flipAxis)=>{
	const offset = location.clone().multiply(flipAxis);
	offset.z = (1500/(offset.z+300));
	offset.w *= degToRag;
	return offset;
}