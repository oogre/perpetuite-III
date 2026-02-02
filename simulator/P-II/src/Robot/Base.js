import { Vector3 } from 'vecteur/3d';
import { Vector2 } from 'vecteur/2d';
import {EventsManager} from "events-manager"
import PromiseHelper from "./../tools/PromiseHelper.js";
import {inverseLerp, lerp} from "./../tools/math.js";
import {isLocation} from "./../tools/validators.js";
import Toggle from "./../tools/Toggle.js";
import RobotUI from "./UI.js";

const xySqDistTo = (a, b) => {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	return dx * dx + dy * dy;
}

const xyLimit = (target, length)=>{
	const hTarget = new Vector2(...target);
	hTarget.limit(length);
	return new Vector3(hTarget.x, hTarget.y, target.z)
}

export default class RobotBase extends EventsManager{
	constructor(conf){
		super();
		this.conf = conf;
		this._speed = 500;
		this._target = new Vector3(...conf.origin);
		this._flipAxis = new Vector3(...conf.flip);

		this._location = new Vector3(0, 0, 0);
		this._locationProjectedOnTable = this._location.clone()

		this._move = new Vector3(0, 0, 0);
		
		this._isInit = false;
		this.ui = new RobotUI(this);
		
		this._reached = new PromiseHelper(()=>{
			this.fire('locationReached', this.offset);
		});
	}
	get position(){
		return `${this._location.x.toFixed(2)} ${this._location.y.toFixed(2)} ${this._location.z.toFixed(2)}`;
	}
	get offset(){
		const offset = this._location.clone().mult(this._flipAxis);
		offset.setZ(1500/(offset.z+300));
		return offset;
	}
	set intersection(value){
		this._locationProjectedOnTable = value;
	}
	get positionOnTable(){
		return `${this._locationProjectedOnTable.z.toFixed(2)}`;
	}
	async go(targetValue){

		if (!isLocation(targetValue)) {
			throw new Error("Set target of Robot should receive a Vector3 or an array");	
		}

		const horizontalTarget = new Vector2(...targetValue);
		horizontalTarget.limit(this.conf.radius);
		targetValue.setX(horizontalTarget.x);
		targetValue.setY(horizontalTarget.y);

		if(await this._reached.isPending()){
			this._reached.reject();
		}
		this._target.set(targetValue);
		this._reached.reset();
		return this._reached.promise;
	}

	async update(deltaTime){
		this._move = Vector3.sub(this._target, this._location);
		const speedAsFloat = inverseLerp(0, this.conf.maxSpeed, this._speed);
		const bellCurve = (curveWidth, x)=>{
			const width = lerp(4, 1.01, curveWidth);
			return 1-Math.pow(width, -1 * x);
		};
		const targetDamping = bellCurve(Math.pow(speedAsFloat, 0.05), this._move.length())
		this._location.add(
			this._move
				.clone()
				.normalize()
				.mult(deltaTime)
				.mult(this._speed)
				.mult(targetDamping)
		);


		if(await this._reached.isPending()){
			if(this._move.lengthSq()<0.1){
				this._reached.resolve();
				if(!this._isInit){
					this._isInit = true;
					this.fire('initilized', this.offset);
				}
			}else{
				this.fire('locationChange', this.offset);
			}
		}
	}
}