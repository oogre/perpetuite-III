
import {Robot_go} from "./../../Robot";
import { Vector4 } from './../../../tools/Vector.js';
import {lerp} from "./../../../tools/math.js";
import {delay} from './../../../tools/helpers.js';
//Move inspector

export const Move_nothing = async (BASE, destination=BASE.robot.location4D)=>{
	BASE.robot.actionDesc = `Move Nothing`;
	try{
		await delay( 1000 );
		return true;
	}finally{
		BASE.robot.actionDescPop();
	}
}