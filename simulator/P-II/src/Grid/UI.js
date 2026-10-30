import BaseUI from './../UI/Base.js';
import { Path2D } from '@napi-rs/canvas';

export default class GridUI extends BaseUI{
	constructor(parent){
		super();
		this.parent = parent;
		this._path = null;
	}
	// La grille ne change jamais : un seul Path2D, construit une fois, en coordonnées du monde
	get path(){
		if(!this._path){
			const r = this.parent.conf.radius.value;
			this._path = new Path2D();
			this.parent.set.forEach(({x, y})=>{
				this._path.moveTo(x + r, y);          // évite le trait entre deux cercles
				this._path.arc(x, y, r, 0, 2 * Math.PI);
			});
		}
		return this._path;
	}
	
	draw(ctx, canvas){
		super.draw(ctx, canvas);
		ctx.fillStyle = `rgb(30, 30, 30)`;
		ctx.fill(this.path);                       // Skia coupe ce qui sort du canvas
		ctx.resetTransform();
	}
}