#!/usr/bin/env zx

const processName = "P-III.launcher";
const rebootMinDelay = 10 * 60 * 1000;
const rebootTimeFilePath = `$PIII_PATH/data/reboot.timestamp`;
const appPath = 'C:/Users/32495/Desktop/perpetuite-III';
//$.verbose = false;

const shutdown = () => {
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
		await $`shutdown.exe -r -t 00 -f`;
		return true;
	}
}

const isPIIILauncherRunning = async ()=>{
	try{
		await $`pgrep ${processName}`;
	}catch(e){
		return false;
	}
}

const cleanKill = async ()=>{
	try{
		await $`killall P-III.cv`;
	}catch(e){}
	try{
		await $`killall P-III.cv.Server`;
	}catch(e){}
	try{
		await $`killall P-III.APP`;
	}catch(e){}
	try{
		await $`killall python.exe`;
	}catch(e){}
	try{
		await $`killall Ace.exe`;
	}catch(e){}
	try{
		await $`taskkill.exe /IM Ace.exe /F`;
	}catch(e){}
	try{
		await $`killall python.exe`;
	}catch(e){}
	try{
		await $`taskkill.exe /IM python.exe /F`;
	}catch(e){}
}

if(!await isPIIILauncherRunning()){
	process.title = processName;
	while(true){
		await $`zx $PIII_PATH/scripts/initAce.mjs`;

		if(!await isPIIIRunning()){
			console.log("Run PIII");
			const {stderr} = await $`P-III`;
			console.log("error collector", stderr);

			await $`zx $PIII_PATH/scripts/kill.mjs`;

			if(stderr.includes("E-STOP")){
				await shutdown();
				break;
			}
			else if(!await reboot()){
				break;
			}
		}else{
			break;
		}
	}
}
