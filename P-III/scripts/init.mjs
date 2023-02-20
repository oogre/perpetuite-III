#!/usr/bin/env zx

const processName = "P-III.launcher";
const rebootMinDelay = 10 * 60 * 1000;
const rebootTimeFilePath = `${process.env.PIII_PATH}/data/reboot.timestamp`;
const appPath = 'C:/Users/32495/Desktop/perpetuite-III';
$.verbose = false;
$.maxBuffer = 500 * 1024 * 1024;

const main = async () =>{
	if(await isPIIILauncherRunning()) return;
	process.title = processName;

	await $`echo START AT : $(date) >> $PIII_PATH/data/P-III.launcher.log`
	await $`zx $PIII_PATH/scripts/initAce.mjs 2>&1 | tee -a $PIII_PATH/data/P-III.launcher.log`;

	if(await isPIIIRunning()) return;

	await $`echo Run ${processName} AT : $(date) >> $PIII_PATH/data/P-III.launcher.log`

	try{
		await $`P-III >> ${process.env.PIII_PATH}/data/P-III.log`;
	}catch({stderr}){
		await $`echo ${JSON.stringify(stderr)} >> $PIII_PATH/data/P-III.launcher.log`;
		if(stderr.includes("E-STOP")){
			return await shutdown();
		}
		else if(stderr.includes("Terminated")){
			return ;
		}
		return await reboot();
	}
}

const shutdown = async () => {
	await $`echo STOP AT : $(date) >> $PIII_PATH/data/P-III.launcher.log`;
	return $`shutdown.exe -s -t 00 -f`;
}

const reboot = async () => {
	await $`echo REBOOT AT : $(date) >> $PIII_PATH/data/P-III.launcher.log`
	let {stdout:lastBootTime} = await $`cat ${rebootTimeFilePath}`
	lastBootTime = parseInt(lastBootTime.replace("\n", ""));
	const now = new Date().getTime();
	await $`echo ${now} > ${rebootTimeFilePath}`
	const durationSinceLastReboot = (now - lastBootTime); // milliseconds
	if(durationSinceLastReboot < rebootMinDelay){
		await $`echo REBOOT CANCELLED AT : $(date) >> $PIII_PATH/data/P-III.launcher.log`
		return false;
	}
	await $`shutdown.exe -r -t 00 -f`;
	return true;
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