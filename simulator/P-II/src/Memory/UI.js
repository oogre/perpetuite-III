import BaseUI from './../UI/Base.js';

export default class MemoryUI extends BaseUI{
	constructor(parent){
		super();
		this.parent = parent;
	}

	draw(ctx){
		super.draw(ctx);
		const matrix = ctx.getTransform();

		const t0 = new Date().getTime()

		this.parent.set.forEach(pill=>{
			ctx.setTransform(matrix);
			ctx.strokeStyle="white";
			ctx.lineWidth = 0.2;
			ctx.stroke(pill.path);
			/*
			ctx.translate(pill.x, pill.y);
			ctx.strokeStyle = "white";
			ctx.lineWidth = 0.1;
			ctx.strokeRect(
				-1*pill.size[0]/2, 
				-1*pill.size[1]/2, 
				pill.size[0], 
				pill.size[1]
			);

			if(pill.isLocked){
				const t1 = pill._timeAtUsedToDraw
				const dT = Math.min(this.parent.conf.lockDuration, t0-t1);
				const rT = 1 - (dT/this.parent.conf.lockDuration);
				ctx.beginPath();
				ctx.arc(0, 0, pill.radius*0.75, 0, 2 * Math.PI * rT);
				ctx.strokeStyle = `rgb(30, 30, 30)`;
				ctx.lineWidth = 0.5;
				ctx.stroke();
			}
			*/
		});
		ctx.resetTransform();
	}
}