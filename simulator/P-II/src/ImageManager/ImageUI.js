import BaseUI from './../UI/Base.js';

export default class ImageUI extends BaseUI{
	constructor(parent){
		super(false);
		this.parent = parent;
		this.image = null;
		this.x = 0;
		this.y = 0;
	}

	draw(ctx, canvas){
		//super.draw(ctx);

		ctx.scale(0.75, 0.75);

		const matrix = ctx.getTransform();
		
		if(this.image !=null){
			ctx.setTransform(matrix);
			ctx.translate(this.x, this.y);
			ctx.translate(-100, -100);
			ctx.fillStyle = "rgba(0,0,0,1)";
			ctx.fillRect(0, 0, 200, 200);
			ctx.drawImage(this.image, 0, 0, 200, 200);
			ctx.resetTransform();
			this.fire("done");	
		}
	}
}