import Pills from "./../Pills";
import ForbiddenUI from './UI.js';
import Area from "./../Area";

export default class Forbidden{
	constructor(conf){
		this.conf = conf;
		this.ui = new ForbiddenUI(this);
		this.areas = [];
	}

	addEach(collection){
		const now = new Date().getTime();
		this.areas = this.areas.filter(({createdAt})=>{
			return now - createdAt < this.conf.lockDuration;
		});

		for(const item of collection){
			this.add(item);
		}
	}
	async add(item){
		const area = new Area(item.contour).inflate(5);
		hasToAdd:{
			for(const other of this.areas){
				/*
				Error: PolyBool: Zero-length segment detected; your epsilon is probably too small or too large
				*/
				if(other.isIntersect(area)){
					other.contour = other.union(area)[0];
					break hasToAdd;
				}
			}
			this.areas.push(area);
		}
	}
	isHover(location){
		return this.areas.some(item=>item.isHover([location.x, location.y]));
	}
	isIntersect(other){
		return this.areas.some(item=>item.isIntersect(other));
	}
}
