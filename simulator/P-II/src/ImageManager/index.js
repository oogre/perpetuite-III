import fs from 'fs-extra';
import {EventsManager} from "events-manager"
import { OBSWebSocket } from 'obs-websocket-js';
import {delay} from "./../tools/helpers.js";
import ImageUI from './ImageUI.js';
import FrameUI from './FrameUI.js';
import { Image } from '@napi-rs/canvas';


export default class ImageManager extends EventsManager{
	constructor(conf, player= false){
		super();
		this.ui = new ImageUI(this);
		this.uiFrame = new FrameUI(this);
		this.obs = new OBSWebSocket();
		this.conf = conf;
		this.allYears = [];
		this.currentYear = 0;
		this.allDays = [];
		this.currentDay = 0;
		this.allHours = [];
		this.currentHour = 0;
		this.allImages = [];
		this.currentImage = 0;
	}
	async onDone(){
		try{
			this.ui.image = null;
			const [path, x, y] = await this.nextImagePath();	
			this.image = new Image();
			this.image.src = await fs.readFile(path)
			this.x = x;
			this.y = y;
			this.fire("loaded")
		}catch(e){
			setTimeout(this.onDone.bind(this), 1000);
		}
	}
	async onLoaded(){
		this.ui.image = this.image;
		this.ui.x = this.x;
		this.ui.y = this.y;
		this.uiFrame.x = this.x;
		this.uiFrame.y = this.y;
	}
	async start(){
		this.ui.on("done", this.onDone.bind(this));
		this.on("loaded", this.onLoaded.bind(this));
		this.ui.fire("done");
	}
	async stop(){
		this.ui.off("done", this.onDone.bind(this));
		this.off("loaded", this.onLoaded.bind(this));
	}

	async nextImagePath(){
		this.currentImage++;
		if(this.currentImage >= this.allImages.length){
			await this.nextHour();
			this.allImages = await this.readFolder(`${this.conf.imageDestPath}/${this.allYears[this.currentYear]}/${this.allDays[this.currentDay]}/${this.allHours[this.currentHour]}`);
			this.allImages = this.allImages.map((fileName)=>{
				const [rX, rY, rZ, rT] = fileName.replace(".png", "").split(" ");
				const time = parseInt(rT);
				return [
					`${process.env.PWD}/${this.conf.imageDestPath}/${this.allYears[this.currentYear]}/${this.allDays[this.currentDay]}/${this.allHours[this.currentHour]}/${fileName}`,
					parseFloat(rX), parseFloat(rY), parseFloat(rT)
				];
			}).sort(([aP, aX, aY, aT], [bP, bX, bY, bT])=>{
				return parseInt(aT)-parseInt(bT);
			});
			this.currentImage = 0;
		}
		return this.allImages[this.currentImage];
	}
	async nextHour(){
		this.currentHour++;
		if(this.currentHour >= this.allHours.length){
			await this.nextDay();
			this.allHours = await this.readFolder(`${this.conf.imageDestPath}/${this.allYears[this.currentYear]}/${this.allDays[this.currentDay]}`);
			this.currentHour = 0;
		}
	}
	async nextDay(){
		this.currentDay++;
		if(this.currentDay >= this.allDays.length){
			await this.nextYear();
			this.allDays = await this.readFolder(`${this.conf.imageDestPath}/${this.allYears[this.currentYear]}`);
			this.currentDay = 0;
		}
	}
	async nextYear(){
		this.currentYear++;
		if(this.currentYear >= this.allYears.length){
			this.allYears = await this.readFolder(this.conf.imageDestPath);
			this.currentYear = 0;
		}
	}

	async readFolder(path){
		const raw = await fs.readdir(path);
		return raw.filter(name=>!name.startsWith("."));
	}

	async listImageToTransportFromSourceToDest(){
		const t0 = new Date().getTime();
		const files = await fs.readdir(this.conf.imageSourcePath);
		return files.map(fileName =>{
			const [rX, rY, rZ, rT] = fileName.replace(".png", "").split(" ");
			const time = parseInt(rT);
			return [
				fileName,
				parseFloat(rX), parseFloat(rY), parseFloat(rT)
			]
		})
	}

	async transportImageFromSourceToDest(){
		const list = await this.listImageToTransportFromSourceToDest();
		await list.map(([fileName, x, y, t1])=>{
			const t2 = new Date(t1);
			return [
				`${this.conf.imageSourcePath}/${fileName}`,
				`${this.conf.imageDestPath}/${t2.getFullYear()}/${String(t2.getMonth()+1).padStart(2, '0')}.${String(t2.getDate()).padStart(2, '0')}/${t2.getHours()}/${fileName}`
			];
		})
		.map(async ([srcFile, destFile])=>{
			return await fs.move(srcFile, destFile, { overwrite: true });
		});
	}
}

/*
	// await this.obs.connect();
	// this.obs.on('InputSettingsChanged', this.displayNextImage.bind(this));
		
	// this.obs.off('InputSettingsChanged', this.displayNextImage.bind(this));
	// await this.obs.disconnect();
	async display(imagePath, x, y, scale=0.2){
		x += 860;//1920/2
		y += 540 - 200;//1080/2
		await this.obs.callBatch([
			{
				requestType : 'SetInputSettings', 
				requestData : {
					inputName: 'Image',
					inputSettings : {
						file : imagePath
					}
				}
			},{
				requestType : 'SetSceneItemTransform', 
				requestData : {
					sceneName: 'Scène 2',
					sceneItemId: 8,
					sceneItemTransform : {
						positionX: x,
						positionY: y,
						scaleX: scale,
						scaleY: scale
					}
				}
			},{
				requestType : 'SetSceneItemTransform', 
				requestData : {
					sceneName: 'Scène 2',
					sceneItemId: 13,
					sceneItemTransform : {
						positionX: x,
						positionY: y,
						scaleX: scale,
						scaleY: scale
					}
				}
			}
		]);
	}
*/



