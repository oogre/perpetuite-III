import {halfCircleFromPoints} from "./../tools/math.js";
import {isLocation, isPath} from "./../tools/validators.js";
import RobotBase from "./Base.js";


export default class Robot extends RobotBase{
	constructor(conf){
		super(conf);
		this.path = [];
		this.grabbedPill = null;
		this._actionDesc = [""];
		this.hoverDangerousPlace = false;
	}

	get actionDesc(){
		return this._actionDesc[0];
	}

	set actionDesc(value){
		this._actionDesc.unshift(value);
	}

	actionDescPop(){
		this._actionDesc.shift();
	}

	async go(target){
		if (!isLocation(target)) {
			throw new Error("go should receive a Vector3 or an array");	
		}	
		await super.go(target);
	}

	async followPath(path){
		if(!isPath(path)){
			throw new Error("followPath should receive a array of location as path");	
		}

		this.ui.path = path;
		for(const point of path){
			await this.go(point);
		}
	}

	// async goArc(targetValue){
	// 	if (!isLocation(targetValue)) {
	// 		throw new Error("Set target of Robot should receive a Vector3 or an array");	
	// 	}
	// 	this.target = targetValue;
	// 	const path = halfCircleFromPoints(this._location.clone(), this._target, this._arcDirection.value)
	// 	await this.followPath(path, targetValue);
	// }
}