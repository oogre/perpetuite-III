import {Robot_go} from './go.js';
import {Camera_capture} from './../Camera';


export const Robot_explore = async (BASE)=>{
	BASE.robot.actionDesc = `Explore`;
	for(const [x, y] of BASE.table.pointToExplore){
		await Robot_go(BASE, [x, y, 0, 0]);
		await Camera_capture(BASE);	
	}
	BASE.robot.actionDescPop();
}