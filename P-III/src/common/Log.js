/*----------------------------------------*\
  P-III - Log.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-10-05 09:47:22
  @Last Modified time: 2022-10-05 10:53:08
\*----------------------------------------*/
import ColorCli from "cli-color";

const TITLE = ColorCli.black.bgWhite;
const COMMAND = ColorCli.cyanBright;
const STEP = ColorCli.greenBright;


const Log = {
	title : (...args) => {
		args.push(" ");
		args.unshift(" ");
		console.log(TITLE(...args));
	},
	command : (...args) => {
		console.log(COMMAND(...args));
	},
	step : (...args) => {
		console.log(STEP(...args));
	},
	step : (...args) => {
		console.log(STEP(...args));
	},
	color : (...args) => {
		args.push(" ");
		args.unshift(" ");
		if(args.includes("blue")) return ColorCli.black.bgBlue(...args);
		if(args.includes("yellow")) return ColorCli.black.bgYellow(...args);
		if(args.includes("red")) return ColorCli.black.bgRed(...args);
		if(args.includes("black")) return ColorCli.whiteBright.bgBlack(...args);
		return `-${args.join(' ')}-`;
	},
	position : (...args) => {
		args.push("]");
		args.unshift("[");
		return ColorCli.whiteBright.bgBlackBright(...args);
	}
} 


export default Log;