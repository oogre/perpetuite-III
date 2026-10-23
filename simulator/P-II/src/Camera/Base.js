import {exec, spawnSync} from 'child_process';
import util from 'util';
const _exec = util.promisify(exec)
import {delay} from "./../tools/helpers.js";

export default class BaseCamera{
	constructor(conf){
		this.conf = conf;
	}
	async start(){
		console.log("Restart camera");
		await _exec(`CAMERA_URL=${this.conf.url} npm run start.camera -- --gain 100`);
		await delay(1000);
	}
	// Le serveur camera ne doit pas survivre à P-II.
	//  - P-II se termine (fin normale, process.exit, SIGINT/SIGTERM, exception non rattrapée) : événement `exit`,
	//    on envoie POST /shutdown tout de suite. L'appel est synchrone : c'est la seule façon de le terminer pendant `exit`.
	//  - P-II est tué net (kill -9, plantage natif, machine éteinte) : plus de ping, et le serveur
	//    s'arrête seul après `--idle-exit` secondes (start.camera.sh le lance avec 30 s).
	keepAlive(interval=5000){
		if(this._keepAlive)return;
		this._keepAlive = setInterval(()=>{
			fetch(`${this.conf.url}/health`, {signal : AbortSignal.timeout(2000)}).catch(()=>{});
		}, interval);
		this._keepAlive.unref(); // ce timer ne retient pas le processus
	}
	shutdownSync(){
		try{
			spawnSync('curl', ['-s', '-m', '2', '-X', 'POST', `${this.conf.url}/shutdown`], {stdio : 'ignore'});
		}catch(error){}
	}
	async isRunning(){
		try{
			console.log(`${this.conf.url}/health`);
			const response = await fetch(`${this.conf.url}/health`, {signal : AbortSignal.timeout(1000)});
			return response.ok;
		}catch(error){
			return false;
		}
	}
	async ensureRunning(){
		if(await this.isRunning())return;
		await this.start();
	}
	// POST JSON. Réessaie 3 fois (en vérifiant que le serveur tourne), puis lève l'erreur.
	// (avant : une réponse {status:"error"} relançait l'appel sans limite)
	async post(path, body, tryCounter=0){
		try{
			const response = await fetch(`${this.conf.url}${path}`, {
				method : 'POST',
				headers : {'Content-Type' : 'application/json'},
				body : JSON.stringify(body),
				signal : AbortSignal.timeout(10000)
			});
			const result = await response.json();
			if(result.status == "success"){
				return result.data;
			}
			throw new Error(result.message ?? `HTTP ${response.status}`);
		}catch(error){
			if(tryCounter >= 3){
				throw error;
			}
			console.log(`[camera] ${error.message} (retry ${tryCounter+1}/3)`);
			await delay(200*(tryCounter+1));
			await this.ensureRunning();
			return this.post(path, body, tryCounter+1);
		}
	}
	// simulation : envoie une image (base64) à analyser
	async sendImage(filename, image){
		return this.post('/upload', {filename, image});
	}
	// vraie caméra : le serveur prend l'image, l'analyse et, si archive=true, l'archive réduite
	async grab(filename, archive=false){
		return this.post('/capture', {filename, archive});
	}
}