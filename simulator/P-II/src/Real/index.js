import Pills from "./../Pills";
import RealUI from './UI.js';

export default class Real{
	constructor(conf, {grid}){
		this.conf = conf;
		this.grid = grid;
		this.ui = new RealUI(this);
		this.pills = new Pills(this.conf);
		for(let i = 0 ; i < this.conf.count ;){
			if(this.creatPillAtRandomFreeLocation()){
				i++
			}
		}
	}
	creatPillAtRandomFreeLocation(){
		const t = this.length;
		let location = this.grid.getRandomCellLocation();
		const pill = this.pills.createPill({
			box :[ location.x, location.y, this.conf.radius.value, this.conf.radius.value]
		});
		this.pills.add(pill);
		return t != this.pills
	}


	async delete(pill){
		const deleted = this.pills.delete(pill);

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