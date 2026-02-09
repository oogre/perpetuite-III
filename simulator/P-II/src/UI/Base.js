import { Vector3 } from './../tools/Vector3.js';
import {EventsManager} from "events-manager"

export default class BaseUI extends EventsManager{
	constructor(hasToClear=true){
		super();
		this._offset = new Vector3();
		this.hasToClear = hasToClear;
	}
	set offset(value){
		this._offset = value;
	}
	draw(ctx, canvas){
		ctx.scale(this._offset.z, this._offset.z);
		ctx.translate(this._offset.x, this._offset.y);
	}
}