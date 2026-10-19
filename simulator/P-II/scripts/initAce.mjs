#!/usr/bin/env zx

const AutoHotkeyPath =  await $`wslpath -w C:/Program\ Files/AutoHotkey/AutoHotkey.exe`;
const AcePath = `C:/Program\ Files\ \(x86\)/Omron/ACE\ 3.8/bin/Ace.exe`;
const DriverPath = '/home/perpetuite/perpetuite-III/driver.perpetuite3.ace.awp';
const FakeUserPath = '/home/perpetuite/perpetuite-III/simulator/P-II/scripts';


console.log(AutoHotkeyPath);


// // $.verbose = false;

// const wait = async t => new Promise(r => setTimeout(()=>r(), t));

// const isAceRunning = async () => {
// 	try{
// 		await $`tasklist.exe | grep "Ace."`;
// 		return true;
// 	}catch(e){
// 		return false;
// 	}
// }

// const isAceReady = async ()=>{
// 	try{
// 		const {stdout:openPortList} = await $`netstat.exe -nao | grep "0.0.0.0:9090"`;
// 		return true;
// 	}catch(e){
// 		return false;
// 	}
// }

// const waitForAceReady = async () =>{
// 	console.log("Waiting for Ace to be ready");
// 	let flag = false;
// 	while(! await isAceReady()){
// 		await wait(1000);
// 		process.stdout.write(".");
// 		flag =true;
// 	}
// 	if(flag){
// 		console.log("");	
// 	}
// }

// const runAce = async () => {
// 	console.log("Run Ace");
	
// 	$`${AceDirectory}/Ace.exe server=ace@43434`;
// 	await wait(10000);
// 	$`${AceDirectory}/Ace.exe client datafile=${DriverPath}`;
// 	await waitForAceReady();
// 	$`${AceDirectory}/Ace.exe client culture=fr-LU loadui="/Src/Interface Homme Machine"`;
// 	// try{
// 	// 	await $`P-III.core.api HighPower -- 0`;
// 	// }catch(error){}
// 	const fakeUser = `${appPath}/P-III/scripts/fakeUser.ahk`;
// 	await $`${AutoHotkeyDirectory}/AutoHotkey.exe ${fakeUser}`;
// }


// if(!await isAceRunning())await runAce();

// process.exit(0);