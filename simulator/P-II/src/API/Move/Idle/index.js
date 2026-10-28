import Move_A from './A.js';
import Move_B from './B.js';



export const Move_Idle = async (BASE, [duration=0]=[])=>{
	return await Move_A(BASE, duration);
}


