import Pills from "./../Pills";
import MemoryUI from './UI.js';

export default class Memory{
	constructor(conf){
		this.conf = conf
		this.ui = new MemoryUI(this);
		this.pills = new Pills(this.conf)
	}

	inject(rawData){
		this.pills.addEach(rawData.map(data=>this.pills.createPill(data)));
	}
}