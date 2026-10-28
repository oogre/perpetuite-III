import {spacedLog} from "./../../tools/helpers.js";
import Pills, {PillModel}  from "./../../Pills";
import {Robot_findFreePillByColorName, Robot_throw} from "./../Robot";
import {Exec_move} from "./move.js";
import {AppError, ERR } from './../../tools/Errors.js' ;

// SET Color to XY
// 	Get PILL for Color
// 	CHECK PILL.XY
// 		NOGO :
// 			return SET Color at XY
// 		NOTHING : 
// 			return SET Color at XY
// 		PILL.COLOR != Color :
// 			return SET Color at XY
// 	MOVE PILL to XY
export const Exec_task = async(BASE, [colorName=(new PillModel.Color()).name, x=BASE.robot.location2D.x, y=BASE.robot.location2D.y], depth=1)=>{
	const task = new Pills(BASE.cmd.conf).createPill({
		avgRGB : (new PillModel.Color(colorName)).rgb,
		box:[x, y]
	});
	
	const pill = await Robot_findFreePillByColorName(BASE, [task.color.name]);
	if(BASE.forbidden.isIntersect(pill)){
		return Exec_task(BASE, [colorName, x, y]);
	}
	if(!pill){
		return Exec_task(BASE, [colorName, x, y]);
	}
	if(pill.color.name != task.color.name){
		return Exec_task(BASE, [colorName, x, y]);
	}
	
	try{
		await Exec_move(BASE, pill, task.location);	
	}catch(error){
		if(error instanceof AppError && error.is(ERR.GRAB)){
			console.log(`${error.message}`);
		 	return Exec_task(BASE, [colorName, x, y]);
		}
		if(error instanceof AppError && error.is(ERR.DROP)){
			console.log(`${error.message}`);
		 	return await Robot_throw(BASE);
		}
		
		throw error;
	}
}




