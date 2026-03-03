import { Vector4, Vector2 } from './../tools/Vector.js';

import {EventsManager} from "events-manager"
import PromiseHelper from "./../tools/PromiseHelper.js";
import {inverseLerp, lerp, shortAngle, TAU, degToRag} from "./../tools/math.js";
import {isLocation} from "./../tools/validators.js";
import Toggle from "./../tools/Toggle.js";
import RobotUI from "./UI.js";

export default class RobotBase extends EventsManager{
	constructor(conf){
		super();
		this.conf = conf;
		this._speed = this.conf.speed;

		this._flipAxis = new Vector4(...conf.flip);
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
	get position(){
		return this._location.toString(1, 1, 1, 0);
	}
	get offset(){
		const offset = this._location.clone().multiply(this._flipAxis);
		offset.z = (1500/(offset.z+300));
		offset.w *= degToRag;
		return offset;
	}
	set intersection(value){
		this._locationProjectedOnTable = value;
	}
	get positionOnTable(){
		return `${this._locationProjectedOnTable.z.toFixed(2)}`;
	}
	
	get wStyled(){
		return `${this._location.w.toFixed(2)}`;
	}
	
	async go(targetValue){
		if (!isLocation(targetValue)) {
			throw new Error("Set target of Robot should receive a Vector4 or an array");	
		}

		const horizontalTarget = new Vector2(...targetValue);
		if(horizontalTarget.lengthSq() > this.conf.radius * this.conf.radius){
			horizontalTarget.setLength(this.conf.radius);	
		}
		targetValue.x = horizontalTarget.x;
		targetValue.y = horizontalTarget.y;
		targetValue.w = Math.min(this.conf.maxRoll, Math.max(this.conf.minRoll, targetValue.w % 360));
		
		if(await this._reached.isPending()){
			this._reached.reject();
		}

		this._target.copy(targetValue);
		this._reached.reset();
		return this._reached.promise;
	}

	async update(deltaTime, now){
		const speedAsFloat = inverseLerp(0, this.conf.maxSpeed, this._speed);
		const bellCurve = (curveWidth, x)=>{
			const width = lerp(4, 1.01, curveWidth);
			return 1-Math.pow(width, -1 * x);
		};
		const damping = (value)=>{
			return bellCurve(Math.pow(speedAsFloat, 0.05), value);
		}

		this._move = this._target.clone().sub(this._location);
		this._move.w = shortAngle(this._location.w, this._target.w, 360);



		this._location.add(
			this._move
				.clone()
				.normalize()
				.multiplyScalar(deltaTime)
				.multiplyScalar(this._speed)
				.multiplyScalar(damping(this._move.length()))
			);
		this._location.w %= 360;

		if(await this._reached.isPending()){
			if(this._move.lengthSq()<0.1){
				this._reached.resolve();
				if(!this._isInit){
					this._isInit = true;
					this.fire('initilized', [this.offset, this._location]);
				}
			}else{
				this.fire('locationChange', [this.offset, this._location]);
			}
		}
	}
}