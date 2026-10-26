import fs from 'fs-extra';

import {Memory_get} from "./get.js";
import {PillModel} from "./../../Pills";
import Area from "./../../Area";

export const Memory_load = (BASE)=>{
	BASE.robot.actionDesc = `Memory load`;
	const defaultPillVertex = new Array(8).fill(0).map((_, id, {length})=>{
		const alpha = id * (Math.PI * 2 / (length - 1))
		return [Math.cos(alpha) * 4.5, Math.sin(alpha) * 4.5]
	});
	
	BASE.memory.addEach(
		fs.readFileSync("./data/memoryStatus", "utf8")
		.split("\n")
		.map(line=>line.split(" "))
		.map(([colorName, x, y, locked, savedAt=new Date().getTime()])=>{
			x = parseFloat(x);
			y = parseFloat(y);
			locked = parseInt(locked);
			savedAt = parseInt(savedAt);
			const area = new Area(
				defaultPillVertex.map(([_x, _y])=>{return [_x+x, _y+y]}),
			 	(new PillModel.Color(colorName)).rgb,
			);
			const age = savedAt - locked;
			area.lockedAt = new Date().getTime() - age;
			return area;
		}).map(area=>BASE.memory.fromArea(area))
	);
	BASE.robot.actionDescPop();
	return true;
}
