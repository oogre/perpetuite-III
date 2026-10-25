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
		let t0 = Date.now();
		console.log(`getNextPattern: start offset=${this.offset}`);
		try {
			const {stdout, stderr} = await _exec(`${this.conf.path} ${this.offset}`, {timeout: 60000});
			if (stderr) console.warn('Generator stderr:', stderr);
			this.offset += 1;
			console.log(`getNextPattern: done in ${Date.now() - t0} ms`);
			t0 = Date.now();
			console.log(`genPath: start`);
			this.pathExtractor.genPath();
			console.log(`genPath: done in ${Date.now() - t0} ms`);
		} catch (e) {
			console.error('Generator failed', e);
			throw e;
		}
		return await Jimp.read(this.conf.drawPath);
	}
}
