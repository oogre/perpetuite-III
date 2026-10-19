

import {isNumber} from "./../../tools/validators.js";


// Log.info("Random w adjustment");
export const Robot_roll = async ({robot}, angle)=>{
	if(angle.length>0 && isNumber(angle[0])){
		await robot.roll(...angle);
		return true;
	}
	return false;
}
