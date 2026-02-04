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
		const now = new Date().getTime();
		this.parent.areas.forEach(item=>{
			if(item.path){
				ctx.strokeStyle=`rgba(255, 0, 0, ${1 - ((now - item.createdAt)/10000)} )`;
				ctx.stroke(item.path);
			}
			
		});
		ctx.resetTransform();
	}
}