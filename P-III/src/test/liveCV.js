import {subProcessTrigger, wait} from './../common/tools.js';

process.stdin.setEncoding("utf8")
process.stdout.setEncoding("utf8")

class CameraGuffy{
	constructor(){
		const {promise, trig, kill} = subProcessTrigger(`P-III.cv`,  []);
		this.promise = promise;
		this.trig = trig;
		this.kill = kill;
		this.killed = false;
	}
	async update(){
		const collectWaiter = this.trig(" ")
		const rawData = await collectWaiter;
		try {
			const rawPills = JSON.parse(rawData);
			const realPills = rawPills.filter(({isPill}) => isPill);
			const fakePills = rawPills.filter(({isPill}) => !isPill);

			console.log("realPills", realPills.map(({circularity})=>circularity));
			// console.log("fakePills", fakePills);
		}
		catch(error){
			console.log(rawData);
			console.error(error);
		}
	}
}







const main = async () => {
	const guffy = new CameraGuffy();


	const autoRun = async () =>{
		await guffy.update();
		await autoRun();
	}
	// process.stdin.on('data', async (data)=>{
	// 	await guffy.update();
	// });

	autoRun();
	await guffy.promise;
};


main()
	.then(()=>console.log("finish"))
	.catch((error)=>console.log(error))
;

// (async () => {
// 	const {promise, trig, kill} = pipe(`${process.env.PIII_PATH}/src/computerVision/test.stdin.py`,  []);
// 	setTimeout(()=>kill(), 4000);
// 	while(isPending(promise)){
// 		const res = await trig();
// 		console.log(res);
// 		await wait(1000);		
// 	}
// 	console.log("FINISHED");
// })();