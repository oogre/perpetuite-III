

export default class Chronos{
	constructor(){
		this.intervaledAt = this.startedAt = new Date();
		this._duration = 0
	}
	interval(){
		this.intervaledAt = new Date();
		this._duration = this.intervaledAt - this.startedAt;
		this.startedAt = new Date();
	}
	get duration(){
		return this._duration/1000;
	}
}