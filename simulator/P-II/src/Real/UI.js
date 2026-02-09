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
	}

	draw(ctx, canvas){
		super.draw(ctx);
		const matrix = ctx.getTransform();
		this.parent.set.forEach(pill=>{
			ctx.setTransform(matrix);
			ctx.translate(pill.x, pill.y);
			ctx.beginPath();
			ctx.arc(0, 0, pill.radius, 0, 2 * Math.PI);
			ctx.fillStyle = `rgb(${pill.color.rgb[0]}, ${pill.color.rgb[1]}, ${pill.color.rgb[2]})`;
			ctx.fill();

			// ctx.font = "4px serif";
			// ctx.fillStyle = "white";
			// ctx.translate(pill.radius, pill.radius);
			// ctx.fillText(pill.hash, 0, 0);

		});
		ctx.resetTransform();
		ctx.setTransform(matrix);
		if(this.image.src){
			ctx.drawImage(this.image, -50, -50, 100, 100);	
		}
		ctx.resetTransform();

		
		this.fire('updated', canvas);
	}
}
