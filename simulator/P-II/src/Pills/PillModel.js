import { Vector3 } from './../tools/Vector3.js';
import { LimitedColorPaletteGenerator } from './../tools/Color.js';
import conf from './../config.js';
import Area from "./../Area";


const xySqDistTo = (a, b) => {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	return dx * dx + dy * dy;
}

export default class PillModel extends Area{
	static Color = LimitedColorPaletteGenerator(conf.pills.colors);
	constructor(conf, {contour=[], avgRGB=[0, 0, 0]}={}){
		super(contour, avgRGB);
		this.conf = conf;
		this._color = new PillModel.Color();
		this._radius = 0;
		this.size = super.size;
		this.color = avgRGB;
	}

	get isLock(){
		return /*super.isLock && */(new Date().getTime()) - this.lockedAt < this.conf.lockDuration;
	}

	get hash(){
		return `${Math.round(super.location.x)} ${Math.round(super.location.y)}`;
	}

	set color([r, g, b]){
		this._color = new PillModel.Color([r, g, b]);
	}
	get color(){
		return this._color;
	}
	set size(value){
		super.size = value;
		this._radius = (super.size[0] + super.size[1]) * 0.25;
	}
	get radius(){
		return this._radius;
	}

	isHover(other){
		if(other instanceof PillModel){
			const D = this.radius + other.radius;
			// console.log(this.radius, other.radius)
			return xySqDistTo(this.location, other.location) < D*D;
		}else if(other instanceof Vector3){
			return xySqDistTo(this.location, other) < (this.radius * this.radius);
		}
		return false;
	}

	getDistanceTo(otherLocation){
		return this.location.xyDistTo(otherLocation);
	}
	
	toString(){
		return `${this._color.name} ${super.toString()} ${this.hash} `
	}
}
