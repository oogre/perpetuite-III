/*----------------------------------------*\
  perpetuite-III - commands.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2023-02-10 16:33:12
  @Last Modified time: 2023-02-13 12:59:55
\*----------------------------------------*/


import DrawModel from './../App/DrawModel.js';
import {wait, lerp} from './../common/tools.js';
import Color from './../common/Color.js';

const minX = -600, maxX = 600;
const minY = -600, maxY = 600;
const oX = 1300;
const oY = 1300;
const dX = 100;
const dY = 100;

const worldToTable = ([x, y]) => {
	return [Math.floor((x + 600) / (oX/dX)), Math.floor((y + 600) / (oY/dY))];
}

(async ()=>{
	await DrawModel.init();
	while(1){
		const cmds = (await DrawModel.GEN()).sort((a, b) => 0.5 - Math.random());
		let sqCmd = new Array(dX).fill(0).map(() => new Array(dY).fill(" "));
		
		for(const cmd of cmds) {
			const [x, y] = worldToTable(cmd.point.toArray(2));
			if(sqCmd[x][y] == " ")
				sqCmd[x][y] = [];
			sqCmd[x][y].push(cmd);
		}

		const cmdListTmp = sqCmd.map(line => line.sort((a, b) => 0.5 - Math.random()))//2DShuffle
							.sort((a, b) => 0.5 - Math.random())
							.flat(2)
							.filter(cmd => cmd != " " && !!cmd);

		let cmdList = [];
		while(cmdListTmp.length>0){
			cmdList = cmdList.concat(cmdListTmp.splice(Math.floor(Math.random() * cmdListTmp.length), Math.floor(lerp(3, 10, Math.random()))));
		}

		// console.log(cmdList.map(({length})=>length));
		// console.log(cmdList.map(cmd=>Object.entries(cmd)));
		console.log(cmdList.map(({color, point})=> `${color} : ${point.toArray(2).map(x=>Math.floor(x))}` ));
		// console.log(cmdList.map(({cmds}) => cmds.point.toArray(2)).flat());



		// console.log(cmdList.map(({log})=>log));

		// console.log(
		// 	sqCmd.map(line => 
		// 		line.map((cell) => 
		// 			cell == " " ? cell : cell[0].log
		// 		).join(" ")
		// 	).join("\n")
		// );



		await wait(100);
	}
})();



