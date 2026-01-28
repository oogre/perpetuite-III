import BaseUI from './../UI/Base.js';

export default class RealUI extends BaseUI{
	constructor(parent){
		super();
		this.parent = parent;
	}

	draw(ctx, canvas){
		super.draw(ctx);
		const matrix = ctx.getTransform();
		this.parent.pills.forEach(pill=>{
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
		this.fire('updated', canvas);
	}
}