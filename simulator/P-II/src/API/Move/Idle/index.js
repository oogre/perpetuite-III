import { Move_A } from './A.js';
import { Move_B } from './B.js';
import {delay} from './../../../tools/helpers.js';



export { Move_A, Move_B };  

export const Move_Idle = async (BASE, [duration=0]=[])=>{
	//return await Move_B(BASE, [duration]);
	return await delay(duration);
}


