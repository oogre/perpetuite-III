export default class Toggle{
	constructor(on=1, off=-1){
		this._on = on;
		this._off = off;
		this._toggle = true;
	}
	get value(){
		this._toggle = !this._toggle;
		return this._toggle?this._on:this._off;
	}
}