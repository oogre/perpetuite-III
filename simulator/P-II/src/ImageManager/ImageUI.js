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

		
		
		if(this.image !=null){
			ctx.translate(this.x, this.y);
			ctx.translate(-100, -100);
			ctx.fillStyle = "rgba(0,0,0,1)";
			ctx.fillRect(10, 10, 180, 180);
			ctx.drawImage(this.image, 0, 0, 200, 200);-
			this.fire("done");	
		}
		ctx.resetTransform();
	}
}