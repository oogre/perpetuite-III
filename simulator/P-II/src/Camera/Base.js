import {exec} from 'child_process';
import util from 'util';
const _exec = util.promisify(exec)
import {delay} from "./../tools/helpers.js";

export default class BaseCamera{
	static CAMERA_CONFIG = {
		API : [
			'http://localhost:8000/upload', 
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				}
			}
		]
	};
	async start(){
		await _exec(`npm run start.camera`);
		console.log("Restart camera");
		await delay(1000);
	}
	async isRunning(){
		try{
			const {stdout, stderr} =  await _exec(`pgrep -f "P-II.camera"; echo $?`)
			if(stdout === "1\n"){
				throw new Error("P-II.camera is not running");
			}
			return true;
		}catch(error){
			return false;
		}
	}
	async call(request, tryCounter=0){
		
		try{
			const response = await fetch(...request);
			const result = await response.json();
			if (result.status == "success"){
				return result.data;
			}
		}catch(error){
			console.log(error.message);
			if(tryCounter>3){
				throw new Error(error);
			}
		}
		return this.call(request, tryCounter+1);	
	}
	async sendImage(filename, image){
		if(!await this.isRunning()){
			await this.start();
		}
		BaseCamera.CAMERA_CONFIG.API[1].body = JSON.stringify({filename,image});
		return await this.call(BaseCamera.CAMERA_CONFIG.API);
	}

}