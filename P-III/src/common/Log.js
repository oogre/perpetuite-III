/*----------------------------------------*\
  P-III - Log.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-10-05 09:47:22
  @Last Modified time: 2022-10-14 10:18:46
\*----------------------------------------*/
import ColorCli from "cli-color";
import fs from 'fs';
import util from 'util';
import _conf_ from './../common/config.js';

const TITLE = ColorCli.black.bgWhite;
const COMMAND = ColorCli.cyanBright;
const STEP = ColorCli.greenBright;
const INFO = ColorCli.cyan;
const ERROR = ColorCli.error;
const WARN = ColorCli.xterm(209);


const log_file = fs.createWriteStream(_conf_.log_path, {flags : 'w'});
const log_stdout = process.stdout;
console.log = function (...args) { //
  log_file.write(`${args.join('')}\n`);
  log_stdout.write(`${args.join('')}\n`);
};

class Log {
	
	title(...args){
		args.push(" ");
		args.unshift(" ");
		console.log(TITLE(...args));
	}
	date(...args){
		console.log(TITLE(...[...args, _conf_.dateFormat.format(new Date()) ]));
	}
	command(...args){
		console.log(COMMAND(...args));
	}
	step(...args){
		console.log(STEP(...args));
	}
	warn(...args){
		console.log(WARN(...args));
	}

	log(...args){
		console.log(...args);
	}

	info(...args){
		args.unshift("\t");
		console.log(INFO(...args));
	}
	error(...args){
		this.Date();
		console.log(ERROR(...args));
	}
	color(...args){
		args.push(" ");
		args.unshift(" ");
		if(args.includes("blue")) return ColorCli.black.bgBlue(...args);
		if(args.includes("yellow")) return ColorCli.black.bgYellow(...args);
		if(args.includes("red")) return ColorCli.black.bgRed(...args);
		if(args.includes("black")) return ColorCli.whiteBright.bgBlack(...args);
		return `-${args.join(' ')}-`;
	}
	position(...args){
		args.push("]");
		args.unshift("[");
		return ColorCli.whiteBright(...args);
	}
	end(){
		log_file.end()
	}
}

const log = new Log();


export default log;