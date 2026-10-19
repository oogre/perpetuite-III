import {EventsManager} from "events-manager"
import { Vector4 } from './../tools/Vector.js';

class ViewPort{
	constructor(){
		this._data = [0, 0, 0, 0];
		this._size = [0, 0];
		this._offset = new Vector4();
	}

	get x(){
		return this._offset.x;
	}
	get y(){
		return this._offset.y;
	}
	get z(){
		return this._offset.z;
	}
	get w(){
		return this._offset.w;
	}

	set offset({x, y, z, w}){
		if(x != this._offset.x || y != this._offset.y || z != this._offset.z || w != this._offset.w){
			this._offset.set(x, y, z, w);
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
			-1 * this._offset.x - this._size[0]/(2 * this._offset.z),
			-1 * this._offset.y - this._size[1]/(2 * this._offset.z),
			-1 * this._offset.x + this._size[0]/(2 * this._offset.z),
			-1 * this._offset.y + this._size[1]/(2 * this._offset.z)
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
		ctx.rotate(this._viewPort.w);
		ctx.scale(this._viewPort.z, this._viewPort.z);
		ctx.translate(this._viewPort.x, this._viewPort.y);
		
		return this._viewPort;
	}
}