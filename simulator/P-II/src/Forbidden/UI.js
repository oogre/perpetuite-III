import BaseUI from './../UI/Base.js';


// Object.defineProperty(Array.prototype, 'chunk', {value: function(n) {
//     return Array.from(Array(Math.ceil(this.length/n)), (_,i)=>this.slice(i*n,i*n+n));
// }});

export default class Forbidden extends BaseUI{
	constructor(parent){
		super();
		this.parent = parent;
	}

	draw(ctx, canvas){
		const viewPort = super.draw(ctx, canvas);
		const now = new Date().getTime();

		this.parent.areas
			.filter(({path, box})=>path && viewPort.contains(box))
			.forEach(({path, createdAt})=>{
				ctx.strokeStyle=`rgba(255, 0, 0, ${now - createdAt / this.parent.conf.lockDuration} )`;
				ctx.stroke(path);
			});
		ctx.resetTransform();
	}
}