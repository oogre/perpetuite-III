import BaseUI from './../UI/Base.js';
import fs from 'fs-extra';
import { Image } from '@napi-rs/canvas';



export default class RealUI extends BaseUI{
	constructor(parent){
		super();
		this.parent = parent;

		this.image = new Image();
		fs.readFile(`${process.env.PWD}/data/notWelcomObject.png`).then(data=>{
			this.image.src = data	
		});
		this._hasToRedraw = true;
	}

	redraw(){
		this._hasToRedraw = true;
	}

	draw(ctx, canvas){
		const viewPort = super.draw(ctx, canvas);

		// if(!this._hasToRedraw)return;
		const matrix = ctx.getTransform();
		let id = 0;
		this.parent.set
			.filter(viewPort.contains.bind(viewPort))
			.forEach(({x, y, radius, color})=>{
				ctx.setTransform(matrix);
				ctx.translate(x, y);
				ctx.beginPath();
				ctx.arc(0, 0, radius, 0, 2 * Math.PI);
				ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
				ctx.fill();
			});
		ctx.resetTransform();
		ctx.setTransform(matrix);
		if(
			this.image.src && 
			viewPort.contains({x : 100, x1 : -50, y : 100, y1 : -50})
		){
			ctx.drawImage(this.image, -50, -50, 100, 100);	
		}
		ctx.resetTransform();
		this.fire('updated', canvas);
		this._hasToRedraw = false;
	}
}
