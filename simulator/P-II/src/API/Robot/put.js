import {Robot_putPillAt} from './putPillAt.js';
import Pills, {PillModel} from "./../../Pills";


export const Robot_put = async (BASE, [colorName])=>{
	
	const listTool = new Pills(BASE.cmd.conf);
	const task = listTool.createPill({
		avgRGB : (new PillModel.Color(colorName)).rgb,
		box:[BASE.robot._location.x, BASE.robot._location.y]
	});


	await Robot_putPillAt(BASE, task);
	
	return true;

}
