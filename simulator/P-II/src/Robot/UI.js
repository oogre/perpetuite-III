import BaseUI from './../UI/Base.js';

export default class RobotUI extends BaseUI{
	constructor(parent){
		super();
		this.parent = parent;
	}

	get headSize(){
		return this.parent.conf.pillSize;
	}

	draw(ctx){
		const matrix = ctx.getTransform();
		ctx.font = "20px serif";
		ctx.fillStyle = "white";
		ctx.translate(this._viewPort.z * this.headSize/2, this._viewPort.z * -this.headSize/2);
		ctx.textAlign = "left";
		ctx.translate(0, -10);
  		ctx.fillText(this.parent.location4D, 0, 0);
  		ctx.translate(0, 20);
  		ctx.fillText(this.parent.positionOnTable, 0, 0);
  		ctx.translate(0, 20);
  		ctx.fillText(this.parent.actionDesc, 0, 0);
  		ctx.setTransform(matrix);

		ctx.scale(this._viewPort.z, this._viewPort.z);

		ctx.lineWidth = 0.2;
		if(this.parent.hoverDangerousPlace){
			ctx.strokeStyle = "red";
		}else{
			ctx.strokeStyle = "white";	
		}
		
		ctx.strokeRect(-this.headSize/2, 0, this.headSize, 0);
		ctx.strokeRect(0, -this.headSize/2, 0, this.headSize);


  		if(this.parent.grabbedPill){
  			const pill = this.parent.grabbedPill;
  			ctx.beginPath();
      		ctx.arc(0, 0, pill.radius, 0, 2 * Math.PI);
      		ctx.fillStyle = `rgb(${pill.color.rgb[0]}, ${pill.color.rgb[1]}, ${pill.color.rgb[2]})`;
      		ctx.fill();
  		}

		ctx.strokeStyle="green";
		ctx.moveTo(0, 0);
		ctx.lineTo(this.parent._move.x, this.parent._move.y);
		ctx.stroke();
		;
		// ctx.strokeStyle="green";
		// ctx.moveTo(0, 0);
		// for(const [x, y] of this._path){
		// 	ctx.lineTo(x, y);
		// 	ctx.stroke();
		// }
		ctx.resetTransform();

	}
}