import Pills from "./../Pills";
import RealUI from './UI.js';


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
	creatPillAtRandomFreeLocation(){
		let location = this.grid.getRandomCellLocation();
		const pill = this.createPill({
			box :[ location.x, location.y, this.conf.radius.value*2, this.conf.radius.value*2]
		});
		return this.add(pill);
	}

	async delete(pill){
		const deleted = super.delete(pill);
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
		let t = null;
		await new Promise(resolve=>{
			t = resolve;
			this.ui.on("updated", t);
		});
		this.ui.off("updated", t);

	}
}