#!/usr/bin/env zx

const processName = "P-III.launcher";

$.verbose = false;

const wait = async t => new Promise(r => setTimeout(()=>r(), t));

const setupParentIP = async () => {
	console.log("Setup Parent IP");
	let {stdout:HOST_IPV4} = await $`ipconfig.exe | grep "Ethernet adapter vEthernet (WSL):" -A 4 | grep -E -o '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}'`;
	HOST_IPV4 = HOST_IPV4.replace("\n", "");
	await $`echo "nameserver ${HOST_IPV4}" > /etc/resolv.conf`;
	return HOST_IPV4;
}

const isAceRunning = async () => {
	try{
		await $`tasklist.exe | grep "Ace."`;
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

const isAceReady = async ()=>{
	try{
		const {stdout:openPortList} = await $`netstat.exe -nao | grep "0.0.0.0:9090"`;
		return true;
	}catch(e){
		return false;
	}
}

const waitForAceReady = async () =>{
	console.log("Waiting for Ace to be ready");
	let flag = false;
	while(! await isAceReady()){
		await wait(1000);
		process.stdout.write(".");
		flag =true;
	}
	if(flag){
		console.log("");	
	}
}


const runAce = async () => {
	console.log("Run Ace");
	$`Ace.exe server=ace@43434`;
	await wait(10000);
	$`Ace.exe client datafile="C:/Users/felix/Desktop/perpetuite-III/ACE.3.8/driver.perpetuite3.ace.awp"`;
	await waitForAceReady();
	$`Ace.exe client culture=fr-LU loadui="/Src/Interface Homme Machine"`;
	await $`AutoHotKey "C:/Users/felix/Desktop/perpetuite-III/P-III/scripts/fakeUser.ahk"`;
}

const shutdown = () => {
	console.log("Run Shutdown");
	return $`AutoHotKey "C:/Users/felix/Desktop/perpetuite-III/P-III/scripts/shutdown.ahk"`;
}

const reboot = () => {
	console.log("Run reboot");
	return $`AutoHotKey "C:/Users/felix/Desktop/perpetuite-III/P-III/scripts/reboot.ahk"`;
}

const onLockCollision = () => {
	console.log("Run onLockCollision");
	return Promise.reject();
}

const isPIIILauncherRunning = async ()=>{
	try{
		await $`pgrep ${processName}`;
	}catch(e){
		return false;
	}
}

const cleanKill = async ()=>{
	await $`killall P-III.liveCV.wrapper`;
	await $`killall P-III.liveCV`;
}

if(!await isPIIILauncherRunning()){
	process.title = processName;
	while(true){
		const parent_IP = await setupParentIP();
		console.log("HOST IP : ", parent_IP);
		if(!await isAceRunning())await runAce();
		if(!await isPIIIRunning()){
			console.log("Run PIII");
			const {stderr} = await $`P-III`;
			console.log(stderr);
			await cleanKill();
			if(stderr.includes("E-STOP")) await shutdown();
			else await reboot();
		}else{
			break;
		}
	}
}
