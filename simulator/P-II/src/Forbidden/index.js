import Pills from "./../Pills";
import ForbiddenUI from './UI.js';

export default class Forbidden{
	constructor(conf){
		this.conf = conf
		this.ui = new ForbiddenUI(this);
		this.pills = new Pills(this.conf)
	}

	inject(rawData){
		this.pills.addEach(rawData.map(data=>this.pills.createPill(data)));
	}

	addEach(notPills){

		console.log(this.conf);
		console.log(this.pills.conf);

		this.pills.addEach(notPills);	
	}
	
}