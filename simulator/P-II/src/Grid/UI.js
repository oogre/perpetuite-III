 import BaseUI from './../UI/Base.js';


export default class GridUI extends BaseUI{
	constructor(parent){
		super();
		this.parent = parent;
	}
	
	draw(ctx, canvas){
		const viewPort = super.draw(ctx, canvas);
		
		const matrix = ctx.getTransform();
		this.parent.set
			.filter(viewPort.contains.bind(viewPort))
			.forEach(({x, y})=>{
				ctx.setTransform(matrix);
				ctx.translate(x, y);
				ctx.beginPath();
				ctx.arc(0, 0, this.parent.conf.radius.value, 0, 2 * Math.PI);
				ctx.fillStyle = `rgb(30, 30, 30)`;
				ctx.fill();
			});
		ctx.resetTransform();
	}
}