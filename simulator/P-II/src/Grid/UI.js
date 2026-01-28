 import BaseUI from './../UI/Base.js';


export default class GridUI extends BaseUI{
	constructor(parent){
		super();
		this.parent = parent;
	}
	
	draw(ctx){
		super.draw(ctx);
		
		const matrix = ctx.getTransform();
		this.parent.set.forEach(({location})=>{
			ctx.setTransform(matrix);
			ctx.translate(location.x, location.y);
			ctx.beginPath();
			ctx.arc(0, 0, this.parent.conf.radius.value, 0, 2 * Math.PI);
			ctx.fillStyle = `rgb(30, 30, 30)`;
			ctx.fill();
		});
		ctx.resetTransform();
	}
}