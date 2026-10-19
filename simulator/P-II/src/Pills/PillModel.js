import { Vector2 } from './../tools/Vector.js';
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
			return this.location.clone().sub(other.location).lengthSq() < D*D;
		}else if(other instanceof Vector2){
			return this.location.clone().sub(other).lengthSq() < (this.radius * this.radius);
		}
		return false;
	}

	getDistanceTo(otherLocation){
		return this.location.clone().sub(otherLocation).length();
	}
	
	toString(){
		return `${this._color.name} ${super.toString()}`
	}
}
