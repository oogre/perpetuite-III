import {Robot_go} from "./../Robot";
import {Exec_whatsBelow, AT_DROPZONE} from './whatsBelow.js';
import { Vector4 } from './../../tools/Vector.js';
import {AppError, ERR} from './../../tools/Errors.js';
export {Memory_getFreeCell} from './../Memory';

const tries = 10;

// Exec findFreeLocation
export const Exec_findFreeLocation = async(BASE)=>{
	BASE.robot.actionDesc = `Find Free Location`;
	try{
		for(const {location} of Memory_getFreeCell(BASE).slice(0, tries)){
			await Robot_go(BASE, new Vector4(...location, 0, 0));
			if(AT_DROPZONE.EMPTY === await Exec_whatsBelow(BASE)) return;   // la capture met la mémoire à jour
		}
		throw new AppError(ERR.FORBIDDEN, "No free location found");
	}finally{
		BASE.robot.actionDescPop();
	}
}