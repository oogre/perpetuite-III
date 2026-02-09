import { Vector3 } from './../tools/Vector3.js';
import {delay} from "./../tools/helpers.js";


const CAMERA_CONFIG = {
	API : [
		'http://localhost:8000/upload', 
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			}
		}
	]
}

const call = async (request)=>{
	const response = await fetch(...request);
	const result = await response.json();
	if (result.status == "success"){
		return result.data;
	}else{
		console.log(response);
		throw new Error(response);
	}
}

export default class Camera {
	constructor(conf, target){
		this.conf = conf;
		this._target = target;
		this._offset = new Vector3();
	}
	
	set offset(value){
		this._offset = value;
	}

	pointToWorldLocation([x, y], canvas){
		return [
			(x - canvas.width/2)/this._offset.z - this._offset.x, 
			(y - canvas.height/2)/this._offset.z - this._offset.y, 
		]
	}
	contourToWorldLocation(contour, canvas){
		return contour.map(([x, y])=>this.pointToWorldLocation([x, y], canvas));
	}
	boxToWorldLocation([x, y, w, h], canvas){
		return [
			...this.pointToWorldLocation([x, y], canvas),
			w/this._offset.z, 
			h/this._offset.z 
		]
	}

	async capture(name){
		return new Promise((resolve, reject)=>{		
			const captureProcess = async (name, canvas)=>{
				await delay(10);
				this._target.off("updated", captureAdapter);
				try {
					CAMERA_CONFIG.API[1].body = JSON.stringify({
						filename: name,
						image: canvas.toDataURL().split(',')[1]
					});
					const rawData = await call(CAMERA_CONFIG.API);

					const data = rawData
						.filter(({box:[x, y, w, h]})=>{
							return 	x - 2*this.conf.margin > 0 && 
									y - 2*this.conf.margin > 0 && 
									x + 2*this.conf.margin < this.conf.width && 
									y + 2*this.conf.margin < this.conf.height
						})
						.map((desc, id)=>{
							return {
								...desc,
								contour : this.contourToWorldLocation(desc.contour, canvas),
								box : this.boxToWorldLocation(desc.box, canvas)
							}
						});
					resolve(data.sort(()=>Math.random()-0.5));
				} catch (error) {
					reject(error);
				}
			}
			const captureAdapter = (canvas)=>captureProcess(name, canvas)
			this._target.on("updated", captureAdapter);
		});
	}
}