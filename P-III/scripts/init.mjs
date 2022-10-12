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

const isAceServerRunning = async ()=>{
	try{
		const {stdout:openPortList} = await $`netstat.exe -nao | grep "0.0.0.0:9090"`;
		return true;
	}catch(e){
		return false;
	}
}

const waitForAceServerRunning = async () =>{
	console.log("Waiting for Ace Server Running")
	while(! await isAceServerRunning()){
		await wait(1000);
		process.stdout.write(".");
	}
}

const runAce = async () => {
	console.log("Run Ace");
	$`Ace.exe server=ace@43434`;
	await wait(10000);
	$`Ace.exe client datafile="C:/Users/felix/Desktop/perpetuite-III/ACE.3.8/driver.perpetuite3.ace.awp"`;
}

const shutdown = () => {
	console.log("Run Shutdown");
	return $`AutoHotKey "C:/Users/felix/Desktop/shutdown.ahk"`;
}

const reboot = () => {
	console.log("Run reboot");
	return $`AutoHotKey "C:/Users/felix/Desktop/reboot.ahk"`;
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

if(!await isPIIILauncherRunning()){
	process.title = processName;
	while(true){
		const parent_IP = await setupParentIP();
		console.log("HOST IP : ", parent_IP);
		if(!await isAceRunning())await runAce();
		await waitForAceServerRunning();
		if(!await isPIIIRunning()){
			console.log("Run PIII");
			const {stderr} = await $`P-III ${parent_IP}`;
			if(stderr == "908") await shutdown();
			if(stderr == "640") await shutdown();
			if(stderr.includes("E-STOP")) await shutdown();
			if(stderr.includes("ECONNREFUSED")) await shutdown();
			if(stderr.includes("collision")) await onLockCollision();
		}else{
			break;
		}
	}
}
