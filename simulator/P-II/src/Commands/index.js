import fs from 'fs-extra';
import { Vector2 } from './../tools/Vector.js';
import PatternGenerator from "./../PatternGenerator"
import Pills, {PillModel} from "./../Pills";
import {isString} from "./../tools/validators.js";

export default class Commands{
	constructor(conf, {grid}){
		this.conf = conf;
		this.grid = grid;
		this.instructions = [];
		this._length = 0;
		this.patterGen = new PatternGenerator(this.conf.generator);
	}

	set taskList(list){
		this._length = list.length;
		fs.writeFileSync(this.conf.commandsPath, `${list.join("\n")}`, "utf8");
	}

	get length(){
		return this._length;
	}

	async getTask(colorName){
		if(!fs.pathExistsSync(this.conf.commandsPath)){
			this.taskList = await this.genTaskList();
		}
		let list = fs.readFileSync(this.conf.commandsPath,"utf8").split("\n");

		if(list.length<=1){
			this.taskList = await this.genTaskList();
			list = fs.readFileSync(this.conf.commandsPath,"utf8").split("\n");
		}
		
		
		const listTool = new Pills(this.conf);
		listTool.addEach(
			list.map(rawTask=>{
				const [color, x, y] = rawTask.split(" ");
				return listTool.createPill({
					box:[parseFloat(x), parseFloat(y)], 
					avgRGB: (new PillModel.Color(color)).rgb
				});	
			})
		);
		
		if(isString(colorName)){
			const task = listTool.getByColorName(colorName).one();
			const isTaskExist = task!==undefined;
			if(isTaskExist){
				listTool.set.delete(task);
				this.taskList = listTool.set.map(pill=>pill.toString());
				return task;
			}else{
				const location = this.grid.getRandomCellLocation();
				return listTool.createPill({
					box:[location.x, location.y], 
					avgRGB: (new PillModel.Color(colorName)).rgb
				});
			}
		}

		const task = listTool.set.one()
		const isTaskExist = task!==null;
		if(isTaskExist){
			listTool.set.delete(task);
			this.taskList = listTool.set.map(pill=>pill.toString());
			return task;
		}

		console.log("There is a problem here");
	}

	async genTaskList(){
		const img = await this.patterGen.getNextPattern();
		const locationToDraw = (location)=>{
			const toImageSize = new Vector2(img.bitmap.width, img.bitmap.height);
			const normalize = new Vector2(this.conf.positionRadius * 2, this.conf.positionRadius * 2);
			const offsetLocation = new Vector2(this.conf.positionRadius, this.conf.positionRadius);
			return location.clone()
				.add(this.conf.positionRadius, this.conf.positionRadius)
				.multiply(toImageSize)
				.divide(normalize);
		}		
		const list = new Pills(this.conf);
		list.addEach(
			this.grid.set.map(cell=>{
				const [x, y] = locationToDraw(cell.location)
				const color = img.getPixelColor(x, y);
				const [R, G, B, A] = [
					color >> 24 & 0xFF, 
					color >> 16 & 0xFF, 
					color >> 8 & 0xFF, 
					color >> 0 & 0xFF
				];

				if(A!=0){
					return list.createPill({
						box:[cell.location.x, cell.location.y], 
						avgRGB:[R, G, B]
					});	
				}
			}).filter(pill=>!!pill)
		);

		let groupedItems = list.set.group((item)=>{
			return `${
				Math.round(Math.round(item.x / 50)*50)
			} ${
				Math.round(Math.round(item.y / 50)*50)
			}`
		}).map(([hash, group])=>{
			// RANDOMIZE SUBGROUP
			group = group.sort(()=>Math.random()-0.5);
			return [hash, group]
		}).map(([hash, group])=>{
			return group.map(pill=>pill.toString()).join("\n");
		});

		if(groupedItems.length == 0){
			groupedItems = await this.genTaskList();
		}

		return groupedItems;
	}
}