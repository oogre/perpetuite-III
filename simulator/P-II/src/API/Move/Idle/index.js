export { Move_A } from './A.js';
export { Move_B } from './B.js';
import {delay} from './../../../tools/helpers.js';

export const Move_Idle = async (BASE, [duration=0]=[])=>{
	
	return await Move_B(BASE, [duration]);
}


