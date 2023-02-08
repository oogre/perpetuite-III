#!/usr/bin/env zx

const appPath = 'C:/Users/32495/Desktop/perpetuite-III';

//$.verbose = false;

const wait = async t => new Promise(r => setTimeout(()=>r(), t));

const isAceRunning = async () => {
	try{
		await $`tasklist.exe | grep "Ace."`;
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
	const AceAPI = `${appPath}/ACE.3.8/driver.perpetuite3.ace.awp`;
	$`Ace.exe client datafile=${AceAPI}`;
	await waitForAceReady();
	$`Ace.exe client culture=fr-LU loadui="/Src/Interface Homme Machine"`;
	try{
		await $`P-III.core.api HighPower -- 0`;
	}catch(error){}
	const fakeUser = `${appPath}/P-III/scripts/fakeUser.ahk`;
	await $`AutoHotkey.exe ${fakeUser}`;
}


if(!await isAceRunning())await runAce();
		

// AutoHotkey.exe "C:/Users/32495/Desktop/perpetuite-III/P-III/scripts/fakeUser.ahk"