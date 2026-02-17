import { Vector3 } from './../tools/Vector3.js';
import {EventsManager} from "events-manager"

class ViewPort{
	constructor(){
		this._data = [0, 0, 0, 0];
		this._size = [0, 0]
		this._offset = [0, 0, 1]
	}

	get x(){
		return this._offset[0];
	}
	get y(){
		return this._offset[1];
	}
	get z(){
		return this._offset[2];
	}

	set offset({x, y, z}){
		if(x != this._offset[0] || y != this._offset[1] || z != this._offset[2]){
			this._offset = [x, y, z];
			this.compute();
		}
	}
	set size({width, height}){
		if(width != this._size[0] || height != this._size[1]){
			this._size = [width, height];
			this.compute();	
		}
	}

	compute(){
		this._data = [
			-1 * this._offset[0] - this._size[0]/(2 * this._offset[2]),
			-1 * this._offset[1] - this._size[1]/(2 * this._offset[2]),
			-1 * this._offset[0] + this._size[0]/(2 * this._offset[2]),
			-1 * this._offset[1] + this._size[1]/(2 * this._offset[2])
		]
	}
	contains({x, y, x1=x, y1=y}){
		return 	x > this._data[0] && 
				x1 < this._data[2] && 
				y > this._data[1] && 
				y1 < this._data[3]
	}
}

export default class BaseUI extends EventsManager{
	constructor(hasToClear=true){
		super();
		this.hasToClear = hasToClear;
		this._viewPort = new ViewPort();
	}
	set offset(value){
		this._viewPort.offset = value;
	}
	draw(ctx, canvas){
		this._viewPort.size = canvas;
		ctx.scale(this._viewPort.z, this._viewPort.z);
		ctx.translate(this._viewPort.x, this._viewPort.y);
		return this._viewPort;
	}
}