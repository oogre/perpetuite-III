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
		// RobotController(this.conf.network)
		// 	.Follow(
		// 		new Array(10)
		// 		.fill(0)
		// 		.map(()=>
		// 			new Vector4(
		// 				Math.random()*600 - 300, 
		// 				Math.random()*600 - 300, 
		// 				Math.random()*-200, 
		// 				Math.random()*80 - 40
		// 			)
		// 		)
		// 	)
		// 	.then(data=>console.log(data))
		// 	.catch(error=>console.log(error))
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
			throw new Error("go should receive a Vector2 Vector3 Vector4");	
		}
		await super.go(target);
	}
}