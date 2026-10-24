import fs from 'fs-extra';
import util from 'util';
import {exec} from 'child_process';
const _exec = util.promisify(exec);
import Jimp from "jimp";
import path from 'path';
import { PathExtractor } from "./../PathGenerator"
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
		console.log(this.conf.offsetFilePath);

		if(!fs.pathExistsSync(this.conf.offsetFilePath)){
			this.offset = 0;
		}
		return parseInt(fs.readFileSync(this.conf.offsetFilePath, "utf8"));
	}
	
	async getNextPattern(){
		console.log(`GEN NEW PATTERN FOR OFFSET ${this.offset}`);
		const res = await call(`${this.conf.path} ${this.offset}`);
		this.offset += 1;
		pathExtractor.genPath();
		return await Jimp.read(this.conf.drawPath);
	}
}
