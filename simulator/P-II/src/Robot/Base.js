import { Vector4, Vector3, Vector2 } from './../tools/Vector.js';

import {EventsManager} from "events-manager"
import PromiseHelper from "./../tools/PromiseHelper.js";
import {delay} from "./../tools/helpers.js";
import {inverseLerp, lerp, shortAngle, TAU, degToRag} from "./../tools/math.js";
import {isLocation} from "./../tools/validators.js";
import Toggle from "./../tools/Toggle.js";
import RobotUI from "./UI.js";

export default class RobotBase extends EventsManager{
	constructor(conf){
		super();
		this.conf = conf;
		this._speed = this.conf.speed;
		this._target = new Vector4(...conf.origin);
		this._location = new Vector4(0, 0, 0, 0);
		this._move = new Vector4(0, 0, 0, 0);
		this._locationProjectedOnTable = this._location.clone()
		
		this._isInit = false;
		this.ui = new RobotUI(this);
		
		this._reached = new PromiseHelper(()=>{
			this.fire('locationReached', this.offset);
		});
	}
	get location2D(){
		return new Vector2(...this._location);
	}
	get location3D(){
		return new Vector3(...this._location);
	}
	get location4D(){
		return new Vector4(...this._location);
	}
	set positionOnTable(value){
		this._locationProjectedOnTable = value;
	}
	get positionOnTable(){
		return `${this._locationProjectedOnTable}`;
	}
	
	async go(targetValue){
		if (!isLocation(targetValue)) {
			throw new Error("Set target of Robot should receive a Vector4 or an array");	
		}
		
		if(await this._reached.isPending()){
			this._reached.reject();
		}

		await delay(10);

		this._target.copy(targetValue);
		this._reached.reset();
		return this._reached.promise;
	}

	async update(deltaTime, now){
		
		const bellCurve = (curveWidth, x)=>{
			const width = lerp(4, 1.01, curveWidth);
			return 1-Math.pow(width, -1 * x);
		};
		const damping = (value)=>{
			const speedAsFloat = inverseLerp(0, this.conf.maxSpeed, this._speed);
			return bellCurve(Math.pow(speedAsFloat, 0.05), value);
		}

		this._move.set(...this._target).sub(this._location);
		this._move.w = shortAngle(this._location.w, this._target.w, 360);
		this._location.add(
			this._move
				.clone()
				.normalize()
				.multiplyScalar(deltaTime * this._speed * damping(this._move.length()))
			);
		this._location.w %= 360;

		if(await this._reached.isPending()){
			if(this._move.lengthSq()<0.1){
				this._reached.resolve();
				if(!this._isInit){
					this._isInit = true;
					this.fire('initilized', this.location4D.clone());
				}
			}else{
				this.fire('locationChange', this.location4D.clone());
			}
		}
	}
}