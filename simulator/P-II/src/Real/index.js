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
			box :[ location.x, location.y, this.conf.radius.value, this.conf.radius.value]
		});
		return this.add(pill);
	}

	async delete(pill){
		const toDelete = this.getByLocation(pill.location);
		const deleted = this.set.delete(toDelete);
		// wait for UI to be updated
		let t = null;
		await new Promise(resolve=>{
			t = resolve;
			this.ui.on("updated", resolve);
		});
		this.ui.off("updated", t);
		return deleted;
	}
}