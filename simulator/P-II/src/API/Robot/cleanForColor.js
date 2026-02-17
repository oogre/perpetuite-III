import {Robot_putPillAt} from './putPillAt.js';
import {Robot_whatsBelow, AT_DROPZONE} from './whatsBelow.js';
import {Memory_get} from './../Memory';
import PillModel from "./../../Pills/PillModel";
import Enum from 'enum';

export const CLEAN_RESULT = new Enum(['NO_GO', 'GOOD', 'EMPTY', 'WRONG']);


export const Robot_cleanForColor = async (BASE, colorName, targetPill=null, depth=0)=>{
	const result = await Robot_whatsBelow(BASE, colorName);
	// console.log(result.toString())
	switch(result){
		case AT_DROPZONE.EMPTY : 
			return CLEAN_RESULT.EMPTY;
		case AT_DROPZONE.NO_GO :
			if(targetPill===null){
				return CLEAN_RESULT.GOOD;
			}
			const subTaskI = await BASE.cmd.getTask(colorName)
			await Robot_putPillAt(BASE, subTaskI, targetPill, depth+1);
			return CLEAN_RESULT.NO_GO;

		case AT_DROPZONE.GOOD_COLOR : 
			if(targetPill===null){
				return CLEAN_RESULT.GOOD;
			}
			//fallback on WRONG_COLOR

		case AT_DROPZONE.WRONG_COLOR:
			const pill = await Memory_get(BASE, BASE.robot._location);
			const subTaskII = await BASE.cmd.getTask(pill.color.name);
			await Robot_putPillAt(BASE, subTaskII, pill, depth+1);
			return CLEAN_RESULT.WRONG;
	}
	
}