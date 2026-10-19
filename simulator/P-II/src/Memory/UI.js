import BaseUI from './../UI/Base.js';

export default class MemoryUI extends BaseUI{
	constructor(parent){
		super();
		this.parent = parent;
	}

	draw(ctx, canvas){
		const viewPort = super.draw(ctx, canvas);
		const matrix = ctx.getTransform();
		const t0 = new Date().getTime()

		this.parent.set
			.filter(viewPort.contains.bind(viewPort))
			.forEach(({path, isLock})=>{
				ctx.setTransform(matrix);
				if(isLock){
					ctx.strokeStyle="red";
				}else{
					ctx.strokeStyle="white";
				}
				ctx.lineWidth = 0.2;
				ctx.stroke(path);
			});
		ctx.resetTransform();
	}
}