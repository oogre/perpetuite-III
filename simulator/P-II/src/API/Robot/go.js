
import { Vector4 } from './../../tools/Vector.js';
import { Robot_limitter } from './limitter.js';
import { Robot_curve } from './curve.js';
import * as Walk from './../Move/Walk';
import {getRandomOne, delay} from './../../tools/helpers.js';
import {lerp, inverseLerp} from './../../tools/math.js';
import {Move_Idle} from './../Move/Idle';

export const Robot_go = async (BASE, location, {enableDamping=true, curve=true}={})=>{
	BASE.robot.actionDesc = `Robot go ${location}`;
	try{
		const origin = BASE.robot.location4D;
		const dest = Robot_limitter(BASE, new Vector4(...location));
		const move = new Vector4().subVectors(origin, dest);
		if(Math.abs(move.x) >= 1 || Math.abs(move.y) >= 1 || Math.abs(move.z) >= 1 || Math.abs(move.w) >= 1){
			if(curve && Math.random()<0.5){
				await Robot_curve(BASE, dest);
			}else{
				await BASE.robot.go(dest);
			}
		}

		if(enableDamping){
			const dampingTime = lerp(20, 2000, inverseLerp(0, BASE.robot.conf.radius * 2, move.length()));
			await Move_Idle(BASE, [dampingTime]);
		}
		return true;
	}finally{
		BASE.robot.actionDescPop();                   // toujours, une seule fois
	}
}

