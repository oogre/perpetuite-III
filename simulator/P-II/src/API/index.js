import readline from "readline"
import {EventsManager} from "events-manager"

import * as Actions from "./Actions.js";
import {isNumber} from "./../tools/validators.js";

export default class API extends EventsManager{
	constructor(BASE){
		super();
		this.BASE = BASE;
		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			terminal: false
		});
		this.rl.on('line', (line) => {
			let [tool, action, ...parameters] = line.split(" ");
			this.fire(
				`${tool}_${action}`, 
				parameters.map(p=>{
					const f = parseFloat(p);
					return Number.isNaN(f) ? p : f;
				})
			);
			this.fire(
				`${tool}`, 
				[action, ...parameters].map(p=>{
					const f = parseFloat(p);
					return Number.isNaN(f) ? p : f;
				})
			);
		});
		this.rl.once('close', () => {

		});
		Object.keys(Actions).forEach(key=>{
			this.on(key, async (...data)=>{
				try{
					process.stdout.write("✓ : ");  
					const result = await Actions[key](this.BASE, ...data);	
					console.log(result);
				}catch(error){
					this.fire("error", error);
				}
			});
		});
	}
	
}

