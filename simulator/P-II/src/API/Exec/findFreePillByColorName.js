import {Robot_go} from './../Robot';
import {Memory_get, Memory_unlock} from './../Memory';
import {Exec_whatsBelow, AT_DROPZONE} from './whatsBelow.js';
import {getRandomOne, delay} from './../../tools/helpers.js';
import * as Walk from './../Move/Walk';
import { Vector2, Vector4 } from './../../tools/Vector.js';
import {AppError, ERR } from './../../tools/Errors.js' ;

export const Exec_findFreePillByColorName = async(BASE, [colorName, depth=0]=[])=>{
	BASE.robot.actionDesc = `Find Free Pill By ColorName`;
	try{
		if(depth==5){
			Memory_unlock(BASE, [colorName]);
		}
		else if(depth>5){
			throw new AppError(ERR.PROC, "findFreePillByColorName loop");
		}
		
		const coloredPills = Memory_get(BASE, [colorName]);
		const unlockColoredPills = coloredPills.filter(pill=>!pill.isLock);

		if(unlockColoredPills.length>0){
			const toolVec = new Vector2();
			const robotLocation = BASE.robot.location2D;
			const distToRobot = (pill)=>{
				return toolVec.subVectors(pill.location, robotLocation).lengthSq();
			}
			const pillsStortedByDistance = unlockColoredPills.toArray()
				.sort((a, b)=> distToRobot(a) - distToRobot(b));

			const id = Math.floor(Math.pow(Math.random(), 3) * pillsStortedByDistance.length);
			const selectedPill = pillsStortedByDistance[id];

			await Robot_go(BASE, selectedPill.location);
			await delay(500);
			const below = await Exec_whatsBelow(BASE, selectedPill.color.name);
			console.log(`Pointing ${below.key}`);
			if(below == AT_DROPZONE.GOOD_COLOR) {
				return selectedPill;
			}
			BASE.memory.delete(selectedPill);
			
			if(Math.random() < 0.5){
				const move = getRandomOne(Walk);
				await move(BASE, new Vector4(...(BASE.grid.getRandom().location), 0, 0));
			}
		}
		return await Exec_findFreePillByColorName(BASE, [colorName, depth+1]);
	}finally{
		BASE.robot.actionDescPop();
	}
}