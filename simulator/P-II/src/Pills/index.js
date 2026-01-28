import FastSet from "collections/fast-set";
import PillModel from './PillModel.js';

export {PillModel};

const contentEquals = (pillA, pillB) => {
	return pillA.isHover(pillB);
}

const contentHash = (pill) => {
	return pill.hash;
}

const getDefault = () => {
	return null;
}

export default class Pills{
	constructor(conf={}){
		this.set = new FastSet([], contentEquals, contentHash, getDefault);
		this.conf = conf;
		this.conf.maxPositionSqRadius = this.conf.positionRadius * this.conf.positionRadius;
	}
	createPill({contour=[], circularity=1, box:[x=0, y=0, w=this.conf.radius.value, h=this.conf.radius.value], avgRGB=(new PillModel.Color()).rgb}){
		const p = new PillModel(this.conf);
		p.contour = contour;
		p.location = [x, y];
		p.color = avgRGB;
		p.size = [w, h];
		p.circularity = circularity;
		return p;
	}
	isPill(pill){
		let result = pill instanceof PillModel;
		if(this.conf.debug && !result)console.log(`This is not a PillModel instance : `, pill);
		return result;
	}
	isOnWorkingArea(pill){
		let result = pill.location.lengthSq() <= this.conf.maxPositionSqRadius;
		if(this.conf.debug && !result)console.log(`This is not on working area : `, pill);
		return result;
	}
	isRound(pill){
		let result = pill.circularity > this.conf.circularity.min;
		if(this.conf.debug && !result)console.log(`This is not circular : `, pill);
		return result;
	}
	isLargeLikeAPill(pill){
		let result = pill.radius > this.conf.radius.min && pill.radius < this.conf.radius.max;
		if(this.conf.debug && !result)console.log(`This is not in size range : `, pill);
		return result;
	}
	isValid(pill){
		return this.isPill(pill) && this.isOnWorkingArea(pill) && this.isRound(pill) && this.isLargeLikeAPill(pill);
	}
	add(item){
		let result = getDefault();
		if(!this.isValid(item))
			return result;
		if(result = this.set.get(item))
			return result;
		if(result = this.find( pill => contentEquals(pill, item)))
			return result;
		return this.set.add(item, item.hash);
	}
	addEach(collection){
		return collection
			.map(item=>this.add(item));
	}
	find(callback){
		return this.set.toArray().find((...p)=>callback(...p));
	}
	getByLocation(location){
		const tmp = this.createPill({box:[location.x, location.y]});
		return this.set.get(tmp) || this.find( pill => contentEquals(pill, tmp));
	}
	getByBox(box=[x=0, y=0, w=this.conf.radius.value, h=this.conf.radius.value]){
		const tmp = this.createPill({box});
		return this.set.filter( pill => contentEquals(pill, tmp)).toArray();
	}
	getByColorName(colorName){
		return this.set.filter( pill => pill.color.name === colorName);
	}
	getRandom(){
		const array = this.set.toArray();
		return array[Math.floor(Math.random() * array.length)];
	}
}