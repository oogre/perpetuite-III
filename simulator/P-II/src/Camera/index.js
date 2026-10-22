import { Vector3 } from './../tools/Vector.js';
import {delay} from "./../tools/helpers.js";
import {lerp, inverseLerp} from "./../tools/math.js";
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

	// pointToWorldLocation([x, y], canvas){
	// 	// console.log("PTW", x, y, canvas.width, canvas.height, this._offset.x, this._offset.y, this._offset.z, this.conf.offset);

	// 	// const m = [
	// 	// 	(x - canvas.width/2)  / this._offset.z - this._offset.x - this.conf.offset[0],
	// 	// 	(y - canvas.height/2) / this._offset.z - this._offset.y - this.conf.offset[1],
	// 	// ];
	// 	// const R = [-this._offset.x, -this._offset.y];   // pose du robot à la capture
	// 	// return this.correctMeasure(R, m);
	// 	//- this._offset.x Robot mm
	// 	// - this._offset.y Robot mm
	// 	//  - this.conf.offset[0] Camera 
	// 	// - this.conf.offset[1] Camera
	// 	return [
	// 		(x - canvas.width /2)/this._offset.z - this.conf.offset[0] - this._offset.x, 
	// 		(y*lerp(1, 1.02, inverseLerp(0, 600, Math.abs(this._offset.y))) - canvas.height/2)/this._offset.z - this.conf.offset[1] - this._offset.y, 
	// 	];
	// }

	
	pixelToWorld([u, v], canvas){
		const SCALE_X = 1.082, SCALE_Y = 1.061;   // échelle réelle = z * SCALE (≈5,41 et 5,30 px/mm mesurés)
		const DRIFT_X = 0.0211, DRIFT_Y = 0.0187; // adaptation en fonction de la position du robot (≈1,9 %)

		// pixel de la buse dans l'image (là où se trouve une pastille posée sous la buse, robot au centre)
		const un = canvas.width  * 0.5 + this._offset.z * this.conf.offset[0];
		const vn = canvas.height * 0.5 + this._offset.z * this.conf.offset[1];
		// décalage pastille - buse, en mm (l'axe x de l'image est inversé par rapport à x du robot)
		const dx = -(u - un) / (this._offset.z * SCALE_X);
		const dy =  (v - vn) / (this._offset.z * SCALE_Y);
		// la pastille apparaît trop près du centre de la table de ~1,9 % de la position du robot
		return [
			-1 * (this._offset.x + dx + DRIFT_X * this._offset.x),
			this._offset.y + dy + DRIFT_Y * this._offset.y,
		];
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
 
	// Camera/correctMeasure.js
	// R = pose du robot à la capture [x, y] (mm)
	// m = mesure BRUTE de pointToWorldLocation, formule d'origine sans aucune correction [x, y] (mm)
	// Retourne la position réelle de la pastille dans le repère du robot (mm).
	// Modèle : T = R + A·(m−R) + b + champ quadratique en R. Ajusté sur 61 pastilles / 242 mesures.
	
	correctMeasure([rx, ry], [mx, my]){
		const r = Math.hypot(rx, ry);
		const k = r > R_MAX ? R_MAX / r : 1;      // on reste dans la zone ajustée
		const a = rx * k / S, b = ry * k / S;
		const t = [mx - rx, my - ry, 1, b, b * b, a, a * b, a * a];
		let dx = 0, dy = 0;
		for (let i = 0; i < t.length; i++) { dx += CX[i] * t[i]; dy += CY[i] * t[i]; }
		return [rx + dx, ry + dy];
	};
}