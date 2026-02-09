import {Robot_putPillAt} from './putPillAt.js';
import {Robot_whatsBelow, AT_DROPZONE} from './whatsBelow.js';
import {Memory_get} from './../Memory';
import PillModel from "./../../Pills/PillModel";


export const Robot_cleanForColor = async (BASE, colorName, targetPill=null, LOG=console.log, depth=0)=>{
	switch(await Robot_whatsBelow(BASE, colorName)){
		case AT_DROPZONE.NO_GO :
			LOG(`${BASE.robot._location.toStyled()} is NO GO AREA`);
			if(targetPill===null){
				return true;
			}
			const subTaskI = await BASE.cmd.getTask(colorName)
			await Robot_putPillAt(BASE, subTaskI, targetPill, depth+1);
			return false;

		case AT_DROPZONE.GOOD_COLOR : 
			LOG(`${BASE.robot._location.toStyled()} is ${PillModel.Color.style(colorName)} : GOOD COLOR`);
			if(targetPill===null){
				return true;
			}
			//fallback on WRONG_COLOR

		case AT_DROPZONE.WRONG_COLOR:
			const pill = await Memory_get(BASE, BASE.robot._location);
			LOG(`${BASE.robot._location.toStyled()} is ${pill.colorStyled} : WRONG COLOR`);
			const subTaskII = await BASE.cmd.getTask(pill.color.name);
			await Robot_putPillAt(BASE, subTaskII, pill, depth+1);
			return false;
	}
	
}