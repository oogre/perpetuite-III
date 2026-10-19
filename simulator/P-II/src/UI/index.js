import sdl from '@kmamal/sdl';
import { createCanvas } from '@napi-rs/canvas';
import Engine from "./../tools/Engine.js";
import BaseUI from "./Base.js";


export default class UI_Manager extends Engine{
	constructor(conf){
		super();
		this._window = sdl.video.createWindow(conf);

		this._window.setPosition(conf.x, conf.y);

		this._canvas = createCanvas(conf.width, conf.height);
		this._layers = [];
		this._window.on('close', ()=>process.exit(0));
	}
	register(obj){
		if(!obj instanceof BaseUI){
			throw new Error(`UI_Manager.register needs an instance on BaseUI`);
		}
		super.register(obj);
		this._layers.push(createCanvas(this._canvas.width, this._canvas.height));
	}
	
	update(){
		const mainCtx = this._canvas.getContext('2d');
		mainCtx.fillStyle = 'black';
		mainCtx.fillRect(0, 0, this._canvas.width, this._canvas.height);
		this._layers.forEach((layer, id)=>{
			const subCtx = layer.getContext('2d');
			if(this._registered[id].hasToClear){
				const matrix = subCtx.getTransform();
				subCtx.setTransform(1, 0, 0, 1, 0, 0);
				subCtx.clearRect(0, 0, layer.width, layer.height);
				subCtx.setTransform(matrix);
			}
			subCtx.translate(layer.width*0.5, layer.height*0.5);
			this._registered[id].draw(subCtx, layer);
			mainCtx.drawImage(subCtx, 0, 0);
		});
		const buffer = Buffer.from(mainCtx.getImageData(0, 0, this._canvas.width, this._canvas.width).data)
		this._window.render(this._canvas.width, this._canvas.width, this._canvas.width * 4, 'rgba32', buffer)
	}
	
	get window(){
		return this._window;
	}
	get canvas(){
		return this._canvas;
	}
	get ctx(){
		return this._canvas.getContext('2d');
	}
}
