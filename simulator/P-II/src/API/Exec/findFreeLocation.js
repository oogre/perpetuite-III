import {Robot_go} from "./../Robot";
import {Exec_whatsBelow, AT_DROPZONE} from './whatsBelow.js';
import { Vector4 } from './../../tools/Vector.js';

export const Exec_findFreeLocation = async(BASE)=>{
	BASE.robot.actionDesc = `Find Free Location`;

	await Robot_go(BASE, new Vector4(...BASE.grid.getRandomCellLocation(), 0, 0));
	if(AT_DROPZONE.EMPTY !== await Exec_whatsBelow()){
		return await Exec_findFreeLocation(BASE);
	}
	
	BASE.robot.actionDescPop();
}