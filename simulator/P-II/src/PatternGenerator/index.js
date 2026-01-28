import fs from 'fs-extra';
import util from 'util';
import {exec} from 'child_process';
const _exec = util.promisify(exec);
import { Jimp } from "jimp";


const call = async (command)=>{
	let {stdout, stderr} = await _exec(command);
	if(stderr){
	  throw stderr;
	}
	return stdout;
}


export default class PatternGenerator{
	constructor(conf){
		this.conf = conf
	}
	set offset(value){
		fs.writeFileSync(this.conf.offsetFilePath, `${value}`, "utf8");
	}
	get offset(){
		if(!fs.pathExistsSync(this.conf.offsetFilePath)){
			this.offset = 0;
		}
		return parseInt(fs.readFileSync(this.conf.offsetFilePath, "utf8"));
	}
	
	async getNextPattern(){
		const res = await call(`./Generator/main.py ${this.offset}`);
		this.offset += 10;
		return await Jimp.read(`./data/patterns/draw.diff.png`);
	}
}
