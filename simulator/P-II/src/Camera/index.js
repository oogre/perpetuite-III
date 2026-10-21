import { Vector3 } from './../tools/Vector.js';
import {delay} from "./../tools/helpers.js";
import BaseCamera from "./Base.js";

// Correction continue (polynôme d'ordre 5) mesure caméra -> position réelle, en mm.
// Ajustée par moindres carrés sur 122 mesures (2 passages x 61 positions, disque r <= 570 mm).
// Validation « nouvelle position » (leave-one-position-out) : 0.88 mm RMS, 1.9 mm max
// (affine : 1.56 mm RMS, 4.0 mm max ; ordre 3 : 1.21 mm RMS). Plancher de répétabilité ~0.76 mm.
//   x' = sum_k CX[k] * (x/S)^i_k * (y/S)^j_k   avec (i_k, j_k) = TERMS[k]
// Entrée : position BRUTE (sans aucune autre correction caméra).
// Hors du disque r > R_MAX, le déplacement est maintenu constant (pas d'extrapolation polynomiale).
const S = 500.0;
const R_MAX = 600;
const TERMS = [[0, 0], [0, 1], [1, 0], [0, 2], [1, 1], [2, 0], [0, 3], [1, 2], [2, 1], [3, 0], [0, 4], [1, 3], [2, 2], [3, 1], [4, 0], [0, 5], [1, 4], [2, 3], [3, 2], [4, 1], [5, 0]];
const CX = [-1.3943163932121343,-0.658968370093286,487.2546134985148,-1.3551914480838692,0.6706461483079189,-2.905533314708386,1.8637954689041765,3.256639932569749,1.5407446812422132,6.31391316694245,0.5847674965024554,0.024395398869872867,2.710128728789624,-0.11678424758800399,2.231005971725406,-0.9107538172572456,-2.450709185222624,-2.572156534989666,-7.462938153392112,-0.5208431634056466,-4.048323138242138];
const CY = [-0.19882760434195657,514.4933129573985,-1.3169555058831988,0.956983602308225,2.630971469578887,1.304212014589833,-11.959841988346227,5.214956830476133,-8.696284443243313,3.8242000123320503,-0.7614923597044717,-2.45484195049327,-3.7551002403145968,-0.6839122584328325,-0.6402975316851861,8.005823612556318,-2.977101474227403,12.019606609604713,-5.088890712205999,-1.6362645624722305,-2.015017829230936];


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
		return correctMeasure([
			((x - canvas.width/2)/this._offset.z - this._offset.x - this.conf.offset[0]), 
			((y - canvas.height/2)/this._offset.z - this._offset.y - this.conf.offset[1]), 
		]);
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
 
	// /** mesure caméra -> position réelle */
	// correctMeasure([x, y], k = this.conf.correction) {
	// 	return [k.A * x + k.B * y + k.TX, k.C * x + k.D * y + k.TY];
	// }
 
	// /** position voulue -> position à mesurer/commander (inverse exact) */
	// inverseCorrection([x, y], k = this.conf.correction) {
	// 	const det = k.A * k.D - k.B * k.C;
	// 	const dx = x - k.TX, dy = y - k.TY;
	// 	return [(k.D * dx - k.B * dy) / det, (-k.C * dx + k.A * dy) / det];
	// }

 
	poly(x, y) {
		let ox = 0, oy = 0;
		const a = x / S, b = y / S;
		for (let k = 0; k < TERMS.length; k++) {
			const m = Math.pow(a, TERMS[k][0]) * Math.pow(b, TERMS[k][1]);
			ox += CX[k] * m; oy += CY[k] * m;
		}
		return [ox, oy];
	}
 
	/** mesure caméra -> position réelle */
	correctMeasure([x, y]) {
		const r = Math.hypot(x, y);
		const k = r > R_MAX ? R_MAX / r : 1;
		const [cx, cy] = [x * k, y * k];
		const [px, py] = poly(cx, cy);
		return [x + (px - cx), y + (py - cy)];
	}
 
	/** position réelle -> position qui serait mesurée (inverse par Newton) */
	inverseCorrection([tx, ty]) {
		let x = tx, y = ty;
		for (let it = 0; it < 30; it++) {
			const [fx, fy] = correctMeasure([x, y]);
			const ex = fx - tx, ey = fy - ty;
			if (Math.hypot(ex, ey) < 1e-9) break;
			const h = 1e-3;
			const [ax, ay] = correctMeasure([x + h, y]);
			const [bx, by] = correctMeasure([x, y + h]);
			const a = (ax - fx) / h, c = (ay - fy) / h, b = (bx - fx) / h, d = (by - fy) / h;
			const det = a * d - b * c;
			x -= (d * ex - b * ey) / det;
			y -= (-c * ex + a * ey) / det;
		}
	return [x, y];
	} 
}