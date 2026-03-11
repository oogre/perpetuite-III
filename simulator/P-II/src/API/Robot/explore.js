import {Robot_go} from './go.js';
import {Camera_capture} from './../Camera';
import { Vector2, Vector4 } from './../../tools/Vector.js';

export const Robot_explore = async (BASE)=>{
	BASE.robot.actionDesc = `Explore`;
	const points = BASE.table.pointToExplore
		.map(([x, y])=>new Vector2(x, y))
		.sort((a, b)=> {
			const d = a.lengthSq() - b.lengthSq() ;
			if(Math.abs(d) > 1000){
				return d;	
			}else{
				return 1
			}
		});
	for(const [x, y] of points){
		await Robot_go(BASE, new Vector4(x, y, 0, 0));
		await Camera_capture(BASE);	
	}
	BASE.robot.actionDescPop();
}