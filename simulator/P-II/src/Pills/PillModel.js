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
	static SAME_PILL = 3 + 1.5;                       // vibrations 3 mm + marge ; doit rester < 8 mm (diamètre d'une pill)


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
		//if(other instanceof PillModel){
		const D = this.radius + other.radius + 2;
		return this.location.clone().sub(other.location).lengthSq() < D*D;
		// }else if(other instanceof Vector2){
		// 	return this.location.clone().sub(other).lengthSq() < ((this.radius + 2) * (this.radius + 3));
		// }
		// return false;
	}
	isSame(other){
		return this.location.clone().sub(other.location).lengthSq() < PillModel.SAME_PILL ** 2;
	}

	getDistanceTo(otherLocation){
		return this.location.clone().sub(otherLocation).length();
	}
	
	toString(){
		return `${this._color.name} ${super.toString()}`
	}
}
