import { Vector3, Vector2 } from './../tools/Vector.js';
import {delay} from "./../tools/helpers.js";
import {lerp, inverseLerp} from "./../tools/math.js";
import BaseCamera from "./Base.js";
import { Matrix3 } from 'three';

export default class Camera extends BaseCamera{
	constructor(conf, target){
		super(conf);
		this._target = target;
		this._offset = new Vector3();
	}
	
	set offset(value){
		this._offset = value;
	}

	pixelToWorld([x, y], canvas){
		const AX = 0.9714, BX = -1.158;
		const AY = 0.9755, BY =  0.078;
		
		const S = 500;
		// polynôme d'ordre 3, termes : 1, b, b², b³, a, ab, ab², a², a²b, a³   (a = qx/500, b = qy/500)
		const CX = [1.62461, -0.46814, -0.22730, 0.16088, 511.28408, -1.12015, 4.45855, -0.96683, 0.00411, 3.29986];
		const CY = [0.16602, 512.25061, -0.33041, 2.72413, -0.25409, 0.86310, 0.87391, -0.33965, -6.96755, 0.63758];

		// const robot  = new Vector2(-this._offset.x, -this._offset.y);
		// // pixel de la buse dans l'image : centre + CAMERA_OFFSET (en px)
		// const nozzle = new Vector2(canvas.width  / 2 + this.conf.offset[0],
	    // 	                       canvas.height / 2 + this.conf.offset[1]);
		// // (pixel - buse) / (px/mm) + position du robot
		// let point = new Vector2(x, y).sub(nozzle).divideScalar(this._offset.z).add(robot);

		const PX_PER_MM = 5.3205, ROT = -0.0118;  
		const M = new Matrix3()
			.multiply(new Matrix3().makeTranslation(-this._offset.x, -this._offset.y))
			.multiply(new Matrix3().makeScale(1 / PX_PER_MM, 1 / PX_PER_MM))
			.multiply(new Matrix3().makeRotation(-ROT))
			.multiply(new Matrix3().makeTranslation(-(canvas.width / 2 + this.conf.offset[0]),
			                                        -(canvas.height / 2 + this.conf.offset[1])));
		let point = new Vector2(x, y).applyMatrix3(M);

		
		// 2) polynôme : d'ordre 3
		const a = point.x / S, b = point.y / S;
		const t = [1, b, b*b, b*b*b, a, a*b, a*b*b, a*a, a*a*b, a*a*a];
		let wx = 0, wy = 0;
		for (let i = 0; i < t.length; i++){ wx += CX[i] * t[i]; wy += CY[i] * t[i]; }
		
		point = new Vector2(wx, wy);
		return [...point];
	}

	contourToWorldLocation(contour, canvas){
		return contour.map(([x, y])=>this.pixelToWorld([x, y], canvas));
	}
	boxToWorldLocation([x, y, w, h], canvas){
		return [
			...this.pixelToWorld([x, y], canvas),
			w/this._offset.z, 
			h/this._offset.z 
		]
	}
	// écarte les formes trop près du bord de l'image, puis passe contours et boîtes dans le repère du monde
	toWorld(rawData, canvas){
		return rawData
			.filter(({box:[x, y, w, h]})=>{
				return 	x - 2*this.conf.margin > 0 && 
						y - 2*this.conf.margin > 0 && 
						x + 2*this.conf.margin < this.conf.width && 
						y + 2*this.conf.margin < this.conf.height
			})
			.map((desc)=>{
				return {
					...desc,
					contour : this.contourToWorldLocation(desc.contour, canvas),
					box : this.boxToWorldLocation(desc.box, canvas)
				}
			});
	}

	// archive=true : garder une image réduite dans data/archive (le `transport` de Camera_capture)
	async capture(name, archive){
		const data = this.conf.src === 'camera'
			? await this.captureFromCamera(name, archive)
			: await this.captureFromSimulation(name);
		return data.sort(()=>Math.random()-0.5);
	}

	// Vraie caméra : pas d'attente du rendu, une seule requête (prise + analyse + archive).
	async captureFromCamera(name, archive){
		// le robot est à l'arrêt quand on capture : on fige sa position avant l'aller-retour réseau
		// le serveur renvoie ses coordonnées dans un repère width x height (--size, 1000 par défaut)
		const canvas = {width : this.conf.width, height : this.conf.height};
		const rawData = await this.grab(name, archive);
		return this.toWorld(rawData, canvas);
	}

	// Simulation : comportement d'origine (on attend que le canvas soit redessiné, puis on l'envoie).
	async captureFromSimulation(name){
		return new Promise((resolve, reject)=>{		
			const captureProcess = async (name, canvas)=>{
				await delay(10);
				this._target.off("updated", captureAdapter);
				try {
					const rawData = await this.sendImage(name, canvas.toDataURL().split(',')[1]);
					resolve(this.toWorld(rawData, canvas));
				} catch (error) {
					reject(error);
				}
			}
			const captureAdapter = (canvas)=>captureProcess(name, canvas)
			this._target.on("updated", captureAdapter);
		});
	}
}