import { Vector3 } from 'vecteur/3d';
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
		throw new Error(response);
	}
}

export default class Camera {
	constructor(target){
		this._target = target;
		this._offset = new Vector3();
	}
	
	set offset(value){
		this._offset = value;
	}

	pointToWorldLocation([x, y, w, h], canvas){
		return [
			(x - canvas.width/2)/this._offset.z - this._offset.x, 
			(y - canvas.height/2)/this._offset.z - this._offset.y, 
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
						.sort(()=>Math.random()-0.5)
						.map((desc, id)=>{
							return {
								...desc,
								box : this.pointToWorldLocation(desc.box, canvas)
							}
						});
					resolve(data);
				} catch (error) {
					reject(error);
				}
			}
			const captureAdapter = (canvas)=>captureProcess(name, canvas)
			this._target.on("updated", captureAdapter);
		});
	}
}