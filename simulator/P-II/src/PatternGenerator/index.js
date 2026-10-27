import fs from 'fs-extra';
import util from 'util';
import {exec} from 'child_process';
const _exec = util.promisify(exec);
import Jimp from "jimp";
import path from 'path';
import { PathExtractor } from "./../PathGenerator"
import {timed} from "./../tools/timed.js";

const call = async (command)=>{
	let {stdout, stderr} = await _exec(command);
	if(stderr){
	  throw stderr;
	}
	return stdout;
}


export default class PatternGenerator{
	constructor(conf){
		this.conf = conf;
		this.pathExtractor = PathExtractor(this.conf.pathExtractor);
	}
	set offset(value){
		fs.mkdirSync(path.dirname(this.conf.offsetFilePath), { recursive: true });
		fs.writeFileSync(this.conf.offsetFilePath, `${value}`, "utf8");
	}
	get offset(){
		if(!fs.pathExistsSync(this.conf.offsetFilePath)){
			this.offset = 0;
		}
		return parseInt(fs.readFileSync(this.conf.offsetFilePath, "utf8"));
	}
	
	async newPattern(){
		const {stdout, stderr} = await _exec(`${this.conf.path} ${this.offset}`, {timeout: 60000});
		if (stderr) {
			console.warn('newPattern stderr:', stderr);
			throw new Error('newPattern stderr:');
		}
		this.offset += 1;
	}

	async newPath(){
		this.pathExtractor.genPath();
	}

	async next(){
		try {
			await timed(this.newPattern.bind(this));
			await timed(this.newPath.bind(this));
			return await Jimp.read(this.conf.drawPath);
		} catch (e) {
			console.error('Generator failed', e);
			throw e;
		}
	}
}
