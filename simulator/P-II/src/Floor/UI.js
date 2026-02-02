import BaseUI from './../UI/Base.js';

export default class FloorUI extends BaseUI{
	constructor(parent){
		super();
		this.parent = parent;
	}
	
	draw(ctx){
		super.draw(ctx);
		
		// ctx.scale(0.1, 0.1);
		ctx.lineWidth = 0.1;
		this.parent.faces.forEach( ({path, centroid}) => {
			ctx.strokeStyle="darkGrey";
			ctx.fillStyle = `white`;
			if(this.parent.focusFace.path === path){
				ctx.strokeStyle="red";
				ctx.fillStyle = `red`;
			}
			ctx.stroke(path);
			ctx.beginPath();
			ctx.arc(centroid.x, centroid.y, 1, 0, 2 * Math.PI);
			ctx.fill();
		});
		ctx.resetTransform();
	}
}