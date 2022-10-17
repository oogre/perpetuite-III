import util from 'util';
import  { spawn } from "child_process";

const wait = async (time) => new Promise(s => setTimeout(()=>s(), time)); 

const isPending = (promise) => util.inspect(promise).includes("pending");

const pipe = (cmd, args)=>{
	let child;
	let subPromise;
	let subPromiseResolver;
	let subPromiseRejecter;
	const promise = new Promise((resolve, reject)=>{
		child = spawn(cmd, args);
		child.stdin.setEncoding('utf-8');
		child.stdout.on('data', (data) => {
  			subPromiseResolver(data.toString());
		});
		child.on("close", code => {
		  console.log("close");
		  resolve();
		  subPromiseRejecter();
		});
		child.stdin.once("error", (error) => {
		  console.log(error);
		  reject(error);
		  subPromiseRejecter();
		});
	});
	return {
		promise,
		trig : ()=>{
			subPromise = new Promise((res, rej)=>{
				subPromiseResolver = res;
				subPromiseRejecter = rej;
				if(isPending(promise)){
					child.stdin.write(`${Math.random()}\n`, (error) => {
						if (error){
							console.log("error",error );
							reject(error);
						}
					});
				}else{
					rej();
				}
			});
			return subPromise;
		},
		kill : ()=>{
			child.kill("SIGINT");
		}
	}
}

// const {promise, trig} = pipe(`${process.env.PIII_PATH}/src/computerVision/test.stdin.py`,  []);

// (async () => {
// 	const res = await trig();
// 	console.log(res);
// 	console.log("FINISHED");
// })();

(async () => {
	const {promise, trig, kill} = pipe(`${process.env.PIII_PATH}/src/computerVision/test.stdin.py`,  []);
	setTimeout(()=>kill(), 4000);
	while(isPending(promise)){
		const res = await trig();
		console.log(res);
		await wait(1000);		
	}
	console.log("FINISHED");
})();