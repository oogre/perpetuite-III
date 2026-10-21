import { Vector3 } from './../tools/Vector.js';
import {delay} from "./../tools/helpers.js";
import BaseCamera from "./Base.js";

export default class Camera extends BaseCamera{
	constructor(conf, target){
		super(conf);
		this._target = target;
		this._offset = new Vector3();
	}
	
	set offset(value){
		this._offset = value;
	}

	pointToWorldLocation([x, y], canvas){
		return this.correctMeasure([
			((x - canvas.width/2)/this._offset.z - this._offset.x - this.conf.offset[0])*1.0, 
			((y - canvas.height/2)/this._offset.z - this._offset.y - this.conf.offset[1])*1.00, 
		])
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
 
	/** mesure caméra -> position réelle */
	correctMeasure([x, y], k = this.conf.correction) {
		return [k.A * x + k.B * y + k.TX, k.C * x + k.D * y + k.TY];
	}
 
	/** position voulue -> position à mesurer/commander (inverse exact) */
	inverseCorrection([x, y], k = this.conf.correction) {
		const det = k.A * k.D - k.B * k.C;
		const dx = x - k.TX, dy = y - k.TY;
		return [(k.D * dx - k.B * dy) / det, (-k.C * dx + k.A * dy) / det];
	}

	// async capture(name){
	// 	return new Promise((resolve, reject)=>{		
	// 		const captureProcess = async (name, canvas)=>{
	// 			await delay(10);
	// 			this._target.off("updated", captureAdapter);
	// 			try {
	// 				const rawData = await this.sendImage(name, canvas.toDataURL().split(',')[1])
	// 				const data = rawData
	// 					.filter(({box:[x, y, w, h]})=>{
	// 						return 	x - 2*this.conf.margin > 0 && 
	// 								y - 2*this.conf.margin > 0 && 
	// 								x + 2*this.conf.margin < this.conf.width && 
	// 								y + 2*this.conf.margin < this.conf.height
	// 					})
	// 					.map((desc, id)=>{
	// 						return {
	// 							...desc,
	// 							contour : this.contourToWorldLocation(desc.contour, canvas),
	// 							box : this.boxToWorldLocation(desc.box, canvas)
	// 						}
	// 					});
	// 				resolve(data.sort(()=>Math.random()-0.5));
	// 			} catch (error) {
	// 				reject(error);
	// 			}
	// 		}
	// 		const captureAdapter = (canvas)=>captureProcess(name, canvas)
	// 		this._target.on("updated", captureAdapter);
	// 	});
	// }
}