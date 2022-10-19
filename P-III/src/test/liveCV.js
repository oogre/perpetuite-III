import {subProcessTrigger, wait} from './../common/tools.js';


process.stdin.setEncoding("utf8")
process.stdout.setEncoding("utf8")

const main = async () => {
	const {promise, trig, kill} = subProcessTrigger(`${process.env.PIII_PATH}/src/computerVision/test.stdin.py`,[]);
	process.stdin.on('data', async (data)=>{
		// if(data == "close\n"){
		// 	return kill();
		// }
		console.log("liveCV", data);
		const res = await trig(data);
		process.stdout.write(res);
	});
	return await promise;
};

const stop = ()=>{
	console.log("FINISHED");
	process.exit();
}

main()
	.then(stop)
	.catch(stop);


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