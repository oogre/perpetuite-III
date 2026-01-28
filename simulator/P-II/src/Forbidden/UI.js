import BaseUI from './../UI/Base.js';


// Object.defineProperty(Array.prototype, 'chunk', {value: function(n) {
//     return Array.from(Array(Math.ceil(this.length/n)), (_,i)=>this.slice(i*n,i*n+n));
// }});

export default class Forbidden extends BaseUI{
	constructor(parent){
		super();
		this.parent = parent;
	}

	draw(ctx){
		super.draw(ctx);

		this.parent.areas.forEach(item=>{
			if(item.path){
				ctx.strokeStyle="red";
				ctx.stroke(item.path);
			}
			// const path = new Path2D();
			// const subject = new Paths64();
			// subject.push_back(MakePath64(pill.contour.flat()));
			// const inflated = InflatePaths64(subject, 10, JoinType.Square, EndType.Polygon, 2, 0);
			// console.log(inflated);

			
			// pill.contour.forEach(([x, y], id)=>{
			// 	if(id==0)
			// 		path.moveTo(x, y);
			// 	else
			// 		path.lineTo(x, y);
			// });

			// ctx.strokeStyle="red";
			// ctx.stroke(path);
		});
		ctx.resetTransform();
	}
}