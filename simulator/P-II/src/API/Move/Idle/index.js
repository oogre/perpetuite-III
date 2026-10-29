import { Move_A } from './A.js';
import { Move_B } from './B.js';
import {delay} from './../../../tools/helpers.js';

export Move_B;
export Move_A;

export const Move_Idle = async (BASE, [duration=0]=[])=>{
	return await delay(duration);
	//return await Move_A(BASE, [duration]);
}


