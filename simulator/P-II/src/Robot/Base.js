import { Vector4, Vector3, Vector2 } from './../tools/Vector.js';

import {EventsManager} from "events-manager"
import {delay} from "./../tools/helpers.js";
import {inverseLerp, lerp, shortAngle, TAU, degToRag} from "./../tools/math.js";
import {isLocation} from "./../tools/validators.js";
import Toggle from "./../tools/Toggle.js";
import RobotUI from "./UI.js";
import RobotController from "./Controller";
import {AppError, ERR } from './../tools/Errors.js' ;

export default class RobotBase extends EventsManager{
	constructor(conf){
		super();
		this.conf = conf;
		this.controller = new RobotController(conf.network);
		this._speed = this.conf.speed;
		this._target = new Vector4(...conf.origin);		
		this._location = new Vector4(0, 0, 0, 0);
		this._move = new Vector4(0, 0, 0, 0);
		this._locationProjectedOnTable = this._location.clone()
		this._isInit = false;
		this.ui = new RobotUI(this);

		this._lastPos = new Vector4();
		this._still = 0;
		this._startedAt = 0;

		this._arrival = {resolve(){}, reject(){}};     // « en attente » dès le départ (première lecture de position -> initilized)
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

	async setSeed(value){
		await this.controller.Speed(value);
	}

	async setHighPower(value){
		await this.controller.HighPower(value);
	}

	async setAcceleration(value){
		await this.controller.Acc(value);
	}

	async setDeceleration(value){
		await this.controller.Dcc(value);
	}

	async setGripper(value){
		await this.controller.Gripper(value);
	}

	async getPosition(){
		const t = await this.controller.GetPosition();
		return new Vector4(...t);
	}

	async stop(){
		await this.controller.Stop();
	}

	
	async go(targetValue){
		if (!isLocation(targetValue)) {
			throw new AppError(ERR.USE, "Set target of Robot should receive a Vector4 or an array");	
		}
		if(!this.conf.simulation){
			await this.controller.Go(targetValue);   // si ACE refuse, l'état n'a pas bougé
		}

		this._arrival?.reject(new AppError(ERR.USE, "Move interrupted by a new target"));
		this._target.copy(targetValue);

		this._startedAt = new Date().getTime();
		this._still = 0;

		return new Promise((resolve, reject)=>{ this._arrival = {resolve, reject}; });
	}

	async update(deltaTime, now){
		if(this._updating || !this._arrival){
			return;// plus d'await isPending	
		}

		this._updating = true;
		try{
			if(this.conf.simulation){
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
			}else{
				const t = await this.controller.GetPosition();
				this._location.copy(new Vector4(...t));
				const delta = this._lastPos.clone().sub(this._location).lengthSq();
				this._lastPos.copy(this._location);
				this._still = delta < 0.01 ? this._still + 1 : 0;      // < 0,1 mm entre deux lectures
			}

			this.fire('locationChange', this.location4D.clone());	

			this._move.set(...this._target).sub(this._location);
			this._move.w = shortAngle(this._location.w, this._target.w, 360);

			const reached = this._move.lengthSq() < 1.0;
			const stopped = this._still >= 6 && now - this._startedAt > 2000;   // immobile depuis ~300 ms
			if(reached || stopped){
				if(!reached) console.log("robot immobile hors tolérance, écart :", this._move.toArray().map(v=>v.toFixed(2)).join(" "));
				if(!this._isInit){ 
					this._isInit = true; this.fire('initilized', this.location4D.clone()); 
				}
				const arrival = this._arrival;
				this._arrival = null;
				arrival.resolve();
			}
		}catch(error){
			console.log(error);   // une lecture ratée ne doit pas tuer le programme
		}finally{
			this._updating = false;
		}
	}
}