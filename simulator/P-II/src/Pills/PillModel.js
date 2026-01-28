import { Vector3 } from 'vecteur/3d';
import { LimitedColorPaletteGenerator } from './../tools/Color.js';
import conf from './../config.js';

const xySqDistTo = (a, b) => {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	return dx * dx + dy * dy;
}

export default class PillModel {
	static Color = LimitedColorPaletteGenerator(conf.pills.colors);
	constructor(conf){
		this.conf = conf;
		this._location = new Vector3(0, 0, 0);
		this._color = new PillModel.Color();
		this._size = [0, 0];
		this._radius = 0;
		this._circularity = 1;
		this.step = 0;
		this._timeAtUsedToDraw = 0;
	}
	unlock(){
		this._timeAtUsedToDraw = 0;
	}
	lock(){
		this._timeAtUsedToDraw = new Date().getTime();
	}
	get isLocked(){
		return new Date().getTime()-this._timeAtUsedToDraw<this.conf.lockDuration;
	}
	set location([x, y, z=0]){
		this._location = new Vector3(x, y, z);
	}
	get location(){
		return this._location;
	}
	get hash(){
		return `${Math.round(this._location.x)} ${Math.round(this._location.y)}`;
	}
	get x(){
		return this._location.x;
	}
	get y(){
		return this._location.y;
	}
	get z(){
		return this._location.z;
	}
	set color([r, g, b]){
		this._color = new PillModel.Color([r, g, b]);
	}
	get color(){
		return this._color;
	}
	set size([w, h]){
		this._size[0] = w;
		this._size[1] = h;
		this._radius = (this._size[0] + this._size[1]) * 0.25;
	}
	get size(){
		return this._size;
	}
	get radius(){
		return this._radius;
	}
	set circularity(value){
		this._circularity = value;
	}
	get circularity(){
		return this._circularity;
	}
	isHover(other){
		if(other instanceof PillModel){
			const D = this.radius + other.radius;
			// console.log(this.radius, other.radius)
			return xySqDistTo(this._location, other.location) < D*D;
		}else if(other instanceof Vector3){
			return xySqDistTo(this._location, other) < (this.radius * this.radius);
		}
		return false;
	}
	getDistanceTo(otherLocation){
		return this._location.xyDistTo(otherLocation);
	}
	toString(){
		return `${this._color.name} ${this.x.toFixed(2)} ${this.y.toFixed(2)}`
	}
}
