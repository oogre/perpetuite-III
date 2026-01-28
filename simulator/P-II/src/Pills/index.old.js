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

export default class Pills extends FastSet{
	constructor(conf={}, content=[]){
		super(content, contentEquals, contentHash, getDefault);
		this.conf = conf;
		this.conf.maxPositionSqRadius = this.conf.positionRadius * this.conf.positionRadius;
	}
	constructClone(data) {
		return new this.constructor(this.conf, data);
	};
	createPill({circularity=1, box:[x=0, y=0, w=this.conf.radius.value, h=this.conf.radius.value], avgRGB=(new PillModel.Color()).rgb}){
		const p = new PillModel(this.conf);
		p.location = [x, y];
		p.color = avgRGB;
		p.size = [w, h];
		p.circularity = circularity;
		return p;
	}

	isPill(pill){
		return pill instanceof PillModel;
	}
	isOnWorkingArea(pill){
		return pill.location.lengthSq() <= this.conf.maxPositionSqRadius;
	}
	isRound(pill){
		return pill.circularity > this.conf.circularity.min;
	}
	isLargeLikeAPIll(pill){
		return pill.radius > this.conf.radius.min && pill.radius < this.conf.radius.max;
	}

	isValid(pill){
		console.log(pill.circularity, this.conf.circularity);
		console.log(this.isPill(pill), this.isOnWorkingArea(pill), this.isRound(pill), this.isLargeLikeAPIll(pill))

		return this.isPill(pill) && this.isOnWorkingArea(pill) && this.isRound(pill) && this.isLargeLikeAPIll(pill);
	}
	add(pill){
		if(this.isValid(pill)){
			return super.add(pill, pill.hash);
		}
	}
	addEach(collection){
		const data = collection.filter(item=>!(super.get(item) || this.find( pill => contentEquals(pill, item))));
		super.addEach(data);
	}
	find(callback){
		return super.toArray().find((...p)=>callback(...p));
	}
	getByLocation(location){
		const tmp = this.createPill({box:[location.x, location.y]});
		return super.get(tmp) || this.find( pill => contentEquals(pill, tmp));
	}
	getByBox(box=[x=0, y=0, w=this.conf.radius.value, h=this.conf.radius.value]){
		const tmp = this.createPill({box});
		return this.filter( pill => contentEquals(pill, tmp)).toArray();
	}
	getByColorName(colorName){
		return this.filter( pill => pill.color.name === colorName);
	}
	getRandom(){
		const array = this.toArray();
		return array[Math.floor(Math.random() * array.length)];
	}
	
}