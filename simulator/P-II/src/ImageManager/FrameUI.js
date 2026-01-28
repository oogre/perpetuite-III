import BaseUI from './../UI/Base.js';

export default class FrameUI extends BaseUI{
	constructor(parent){
		super(true);
		this.parent = parent;
		this.x = 0;
		this.y = 0;
	}

	draw(ctx, canvas){
		//super.draw(ctx);

		ctx.scale(0.75, 0.75);

		// const matrix = ctx.getTransform();
		
		// ctx.setTransform(matrix);
		ctx.translate(this.x, this.y);
		// ctx.translate(-10, -10);
		// ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
		// ctx.strokeRect(0, 0, 200, 200);
		ctx.beginPath();
		ctx.arc(0, 0, 20, 0, 2 * Math.PI);
		ctx.strokeStyle = `rgba(255, 255, 255, 0.7)`;
		ctx.stroke();

		ctx.resetTransform();
	}
}
