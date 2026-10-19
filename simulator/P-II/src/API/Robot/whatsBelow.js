import Enum from 'enum';
import {Camera_capture} from './../Camera';

export const AT_DROPZONE = new Enum(['NO_GO', 'GOOD_COLOR', 'EMPTY', 'WRONG_COLOR']);

export const Robot_whatsBelow = async(BASE, colorName)=>{
	const justCapturedPills = await Camera_capture(BASE);
	const pill = justCapturedPills.getByLocation(BASE.robot.location2D);

	if(pill === undefined){
		return AT_DROPZONE.EMPTY;
	}else if(BASE.forbidden.isIntersect(pill)){
		return AT_DROPZONE.NO_GO;
	}else if(pill.color.name !== colorName){
		return AT_DROPZONE.WRONG_COLOR;
	}else{
		return AT_DROPZONE.GOOD_COLOR;			
	}
}