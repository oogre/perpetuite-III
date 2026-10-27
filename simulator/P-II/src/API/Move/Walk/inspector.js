
import {Robot_go} from "./../../Robot";
import { Vector4 } from './../../../tools/Vector.js';



export const Move_inspector = async (BASE, destination=BASE.robot.location4D)=>{
	for(const task of BASE.data.history.tasks){
		console.log(task);
	}

	return true;
}