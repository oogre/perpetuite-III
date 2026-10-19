import fs from 'fs-extra';
import { Image } from '@napi-rs/canvas';
import {EventsManager} from "events-manager"
import {delay} from "./../tools/helpers.js";
import ImageUI from './ImageUI.js';
import FrameUI from './FrameUI.js';


export default class ImageManager extends EventsManager{
	constructor(conf, player= false){
		super();
		this.ui = new ImageUI(this);
		this.uiFrame = new FrameUI(this);
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
			const [path, t, x, y] = await this.nextImagePath();	
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
				const [rT, rX, rY, rZ] = fileName.replace(".png", "").split(" ");
				return [
					`${process.env.PWD}/${this.conf.imageDestPath}/${this.allYears[this.currentYear]}/${this.allDays[this.currentDay]}/${this.allHours[this.currentHour]}/${fileName}`,
					parseInt(rT), parseFloat(rX), parseFloat(rY)
				];
			}).sort(([aP, aT, aX, aY], [bP, bT, bX, bY])=>{
				return aT-bT;
			});
			this.currentImage = Math.max(0, this.allImages.length-500);
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

	async listImageToTransport(){
		const t0 = new Date().getTime();
		const files = await fs.readdir(this.conf.imageSourcePath);
		return files.map(fileName =>{
			const [rT, rX, rY, rZ] = fileName.replace(".png", "").split(" ");
			const time = parseInt(rT);
			return [
				fileName,
				parseFloat(rT), parseFloat(rX), parseFloat(rY)
			]
		})
	}

	async removeImageFromSource(){
		const list = await this.listImageToTransport();
		await list.map(([fileName, t1, x, y])=>{
			return `${this.conf.imageSourcePath}/${fileName}`;
		})
		.filter((srcFile)=>{
			return fs.existsSync(srcFile);
		})
		.map(async (srcFile)=>{
			try{
				return await fs.remove(srcFile);	
			}catch(error){
				console.log(srcFile);
				console.log(error);
			}
		});
	}

	async transportImageFromSourceToDest(){
		const list = await this.listImageToTransport();
		await list.map(([fileName, t1, x, y])=>{
			const t2 = new Date(t1);
			return [
				`${this.conf.imageSourcePath}/${fileName}`,
				`${this.conf.imageDestPath}/${t2.getFullYear()}/${String(t2.getMonth()+1).padStart(2, '0')}.${String(t2.getDate()).padStart(2, '0')}/${t2.getHours()}/${fileName}`
			];
		})
		.filter(([srcFile, destFile])=>{
			return fs.existsSync(srcFile);
		})
		.map(async ([srcFile, destFile])=>{
			try{
				return await fs.move(srcFile, destFile, { overwrite: true });	
			}catch(error){
				console.log(srcFile);
				console.log(destFile);
				console.log(error);
			}
		});
	}
}