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
		this.conf.minArea = this.conf.radius.min * this.conf.radius.min * Math.PI;
		this.conf.maxArea = this.conf.radius.max * this.conf.radius.max * Math.PI;		
	}
	createPill({contour=[], circularity=1, box:[x=0, y=0, w=this.conf.radius.value*2, h=this.conf.radius.value*2], avgRGB=(new PillModel.Color()).rgb}){
		const p = new PillModel(this.conf);
		p.contour = contour;
		p.location = [x, y];
		p.color = avgRGB;
		p.size = [w, h];
		p.circularity = circularity;
		p.area = p.area || (w * h * 0.25 * Math.PI);
		return p;
	}

	fromArea(area){
		const p = new PillModel(this.conf, area.inflate(1));
		p.color = area.color;
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
		let result = pill.area > this.conf.minArea && pill.area < this.conf.maxArea;
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
	delete(item){
    	if(!!item){
    		return this.set.deleteAll(item);
		}
    	return false;
	}
	deleteEach(collection){
		return collection
			.map(item=>this.delete(item));
	}
	find(callback){
		return this.set.toArray().find((...p)=>callback(...p));
	}
	getByLocation(location){
		const tmp = this.createPill({box:[location.x, location.y]});
		return this.set.get(tmp) || this.find( pill => contentEquals(pill, tmp));
	}
	getByBox(box=[x=0, y=0, w=this.conf.radius.value*2, h=this.conf.radius.value*2]){
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