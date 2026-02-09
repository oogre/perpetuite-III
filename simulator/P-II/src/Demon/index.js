import { Vector3 } from './../tools/Vector3.js';


export default class Demon{
	constructor(BASE){
		this.BASE = BASE;
	}

	swapColor(){
		const pills = this.BASE.real.pills.toArray();
		const A = pills[Math.floor(Math.random() * pills.length)];
		const B = pills[Math.floor(Math.random() * pills.length)];
		A.color = B.color.rgb;
	}

	move(){
		const pills = this.BASE.real.pills.toArray();
		const A = pills[Math.floor(Math.random() * pills.length)];
		this.BASE.real.pills.delete(A);
		A.location.add(new Vector3().randomize(new Vector3(-1, -1, -1), new Vector3(1, 1, 1)).normalize().mult(2));
		this.BASE.real.pills.add(A);
	}

	remove(){
		const pills = this.BASE.real.pills.toArray();
		const A = pills[Math.floor(Math.random() * pills.length)];
		this.BASE.real.pills.delete(A);
	}

	create(){
		this.BASE.real.creatPillAtRandomFreeLocation()
	}

	unlock(){
		const pills = this.BASE.real.pills.toArray();
		const A = pills[Math.floor(Math.random() * pills.length)];
		A.unlock();
	}

	async update(deltaTime){

		// this.remove()
		// this.create()
		// 
		//this.move()
		//OK//this.swapColor()
		
	}
}