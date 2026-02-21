
export default class Engine{
	constructor(interval=50){
		this._registered = [];
		this._looping = setInterval(this.update.bind(this), interval);
		this._lastFrameAt = new Date().getTime();
	}
	register(obj){
		this._registered.push(obj);
	}
	update(){
		const now = new Date().getTime();
		const deltaTime = (now-this._lastFrameAt)*0.001;
		this._registered.forEach((item, id)=>{
			item.update(deltaTime, now);
		});
		this._lastFrameAt = now;
	}
	forAllRegistered(action){
		for(const element of this._registered){
			action(element);
		}
	}

	stop(){
		clearInterval(this._looping);
	}
}