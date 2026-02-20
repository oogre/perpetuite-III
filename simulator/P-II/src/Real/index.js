import Pills, {PillModel} from "./../Pills";
import RealUI from './UI.js';
import fs from 'fs-extra';

export default class Real extends Pills{
	constructor(conf, {grid}){
		super(conf);
		this.grid = grid;
		this.ui = new RealUI(this);
		for(let i = 0 ; i < this.conf.count ;){
			if(this.creatPillAtRandomFreeLocation()){
				i++
			}
		}
	}

	save(){
		const list = this.set.map(pill=>pill.toString());
		fs.writeFileSync(this.conf.pillSavePath, `${list.join("\n")}`, "utf8");		
	}

	load(){
		let list = fs.readFileSync(this.conf.pillSavePath,"utf8").split("\n");
		if(list.length==0){
			return "NOTHING TO LOAD";
		}
		this.set.clear();
		return list.map(rawTask=>{
			const [color, x, y] = rawTask.split(" ");
			return this.add(
				this.createPill({
					box:[parseFloat(x), parseFloat(y)], 
					avgRGB: (new PillModel.Color(color)).rgb
				})
			);
		});
	}

	creatPillAtRandomFreeLocation(){
		let location = this.grid.getRandomCellLocation();
		const pill = this.createPill({
			box :[ location.x, location.y, this.conf.radius.value*2, this.conf.radius.value*2]
		});
		return this.add(pill);
	}

	async delete(pill){
		const toDelete = super.getByLocation(pill.location)
		const deleted = super.delete(toDelete);
		this.ui.redraw();

		// wait for UI to be updated
		let t = null;
		await new Promise(resolve=>{
			t = resolve;
			this.ui.on("updated", t);
		});
		this.ui.off("updated", t);
		return deleted;
	}


	async add(pill){
		super.add(pill);
		this.ui.redraw();

		let t = null;
		await new Promise(resolve=>{
			t = resolve;
			this.ui.on("updated", t);
		});
		this.ui.off("updated", t);

	}
}