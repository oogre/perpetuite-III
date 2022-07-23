#!/usr/bin/env node
/*----------------------------------------*\
  randomPositionGenerator - index.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-07-23 01:10:01
  @Last Modified time: 2022-07-23 01:49:14
\*----------------------------------------*/
import { Command } from 'commander';
const program = new Command();

// ./release/index.js -t 1000 -- -600 600 -600 600 -200 0 -45 45

const lerp = (a, b, c) => (1-c) * a + c * b;

program
	.option('-t, --timeout <timeout>', 'delay between nPlet', parseInt)
	.description('Tell the robot to go at a position x y z with a orientation of w')
	.action( ({timeout}, {args}) => {
		
		let limits = [];
		while(args.length >=2){
			limits.push([parseFloat(args.shift()), parseFloat(args.shift())]);
		}
		
		const generator = () => limits.map( values => lerp(...[...values, Math.random()]));
		const loop = () => {
			console.log(...generator());
			setTimeout(loop, timeout);
		}
		loop();
	});









program.parse();