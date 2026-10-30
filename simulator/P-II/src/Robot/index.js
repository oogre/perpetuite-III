import {halfCircleFromPoints} from "./../tools/math.js";
import {isLocation, isPath} from "./../tools/validators.js";
import RobotBase from "./Base.js";
import { Vector4 } from './../tools/Vector.js';

export default class Robot extends RobotBase {
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
		if(this._actionDesc.length > 1) this._actionDesc.shift();
	}

	async go(target){
		if (!isLocation(target)) {
			throw new Error("go should receive a Vector2 Vector3 Vector4");	
		}
		await super.go(target);
	}
}