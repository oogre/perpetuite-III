import { Vector3, Vector2 } from './../tools/Vector.js';
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

	pointToWorldLocation([x, y], canvas){
		const AX = 0.9714, BX = -1.158;
		const AY = 0.9755, BY =  0.078;
		
		const S = 500;
		// polynôme d'ordre 3, termes : 1, b, b², b³, a, ab, ab², a², a²b, a³   (a = qx/500, b = qy/500)
		const CX = [1.62461, -0.46814, -0.22730, 0.16088, 511.28408, -1.12015, 4.45855, -0.96683, 0.00411, 3.29986];
		const CY = [0.16602, 512.25061, -0.33041, 2.72413, -0.25409, 0.86310, 0.87391, -0.33965, -6.96755, 0.63758];

		new Vector2(x, y)
		const robot  = new Vector2(-this._offset.x, -this._offset.y);
		// pixel de la buse dans l'image : centre + CAMERA_OFFSET (en px)
		const nozzle = new Vector2(canvas.width  / 2 + this.conf.offset[0],
	    	                       canvas.height / 2 + this.conf.offset[1]);
		// (pixel - buse) / (px/mm) + position du robot
		let point = new Vector2(x, y).sub(nozzle).divideScalar(this._offset.z).add(robot);
		
		// 2) polynôme d'ordre 2
		//point = new Vector2((point.x - BX) / AX, (point.y - BY) / AY);

		// 2) polynôme : d'ordre 3
		const a = point.x / S, b = point.y / S;
		const t = [1, b, b*b, b*b*b, a, a*b, a*b*b, a*a, a*a*b, a*a*a];
		let wx = 0, wy = 0;
		for (let i = 0; i < t.length; i++){ wx += CX[i] * t[i]; wy += CY[i] * t[i]; }
		
		point = new Vector2(wx, wy);
		return [...point];
	}

	
	pixelToWorld([u, v], canvas){
		const SCALE_X = 1.082, SCALE_Y = 1.061;   // échelle réelle = z * SCALE (≈5,41 et 5,30 px/mm mesurés)
		const DRIFT_X = 0.024, DRIFT_Y = 0.0187; // adaptation en fonction de la position du robot (≈1,9 %)

		// pixel de la buse dans l'image (là où se trouve une pastille posée sous la buse, robot au centre)
		const un = canvas.width  * 0.5 + this._offset.z * this.conf.offset[0];
		const vn = canvas.height * 0.5 + this._offset.z * this.conf.offset[1];
		// décalage pastille - buse, en mm (l'axe x de l'image est inversé par rapport à x du robot)
		const dx =  (u - un) / (this._offset.z * SCALE_X);
		const dy =  (v - vn) / (this._offset.z * SCALE_Y);
		// la pastille apparaît trop près du centre de la table de ~1,9 % de la position du robot
		return [
			-1 * this._offset.x + dx + DRIFT_X * this._offset.x,
			-1 * this._offset.y + dy + DRIFT_Y * this._offset.y,
		];
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