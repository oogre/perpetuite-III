#!/usr/bin/env zx

const processName = "P-III.launcher";
const rebootMinDelay = 10 * 60 * 1000;
const rebootTimeFilePath = `${process.env.PIII_PATH}/data/reboot.timestamp`;
const appPath = 'C:/Users/32495/Desktop/perpetuite-III';
//$.verbose = false;


const main = async () =>{

	if(await isPIIILauncherRunning()) return;

	process.title = processName;
		
	await $`zx $PIII_PATH/scripts/initAce.mjs`;

	if(await isPIIIRunning()) return;

	console.log("Run PIII");
	try{
		await $`P-III`;
	}catch({stderr}){
		console.log("error collector", stderr);
		await $`zx $PIII_PATH/scripts/kill.mjs`;
		if(stderr.includes("E-STOP")) return await shutdown();
		else return await reboot();
	}
}


const shutdown = () => {
	// return console.log("shutdown.exe -s -t 00 -f");
	return $`shutdown.exe -s -t 00 -f`;
}

const reboot = async () => {
	console.log("Run reboot");
	let {stdout:lastBootTime} = await $`cat ${rebootTimeFilePath}`
	lastBootTime = parseInt(lastBootTime.replace("\n", ""));
	const now = new Date().getTime();
	await $`echo ${now} > ${rebootTimeFilePath}`
	const durationSinceLastReboot = (now - lastBootTime); // milliseconds
	if(durationSinceLastReboot < rebootMinDelay){
		console.log("somethingWentWrong")
		return false;
	}else{
		// return console.log("shutdown.exe -r -t 00 -f");
		await $`shutdown.exe -r -t 00 -f`;
		return true;
	}
}

const isPIIILauncherRunning = async ()=>{
	try{
		await $`pgrep ${processName}`;
		return true;
	}catch(e){
		return false;
	}
}

const isPIIIRunning = async () => {
	try{
		await $`pgrep P-III.APP`;
		return true;
	}catch(e){
		return false;
	}
}

await main();

process.exit(0);