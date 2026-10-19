#!/usr/bin/env zx

$.verbose = true;
const translateAddress = async (address, destination)=>{
	return (await $`wslpath ${destination=="ubuntu"?"-u" : "-w"} ${address}`).stdout.trim()
}


const AutoHotkeyPath =  await translateAddress(`C:/Program\ Files/AutoHotkey/AutoHotkey.exe`, "ubuntu");
const AcePath = await translateAddress(`C:/Program\ Files\ \(x86\)/Omron/ACE\ 3.8/bin/Ace.exe`, "ubuntu");
const DriverPath = await translateAddress('~/perpetuite-III/driver.perpetuite3.ace.awp', "windows");
const FakeUserPath = await translateAddress('~/perpetuite-III/simulator/P-II/scripts', "windows");


console.log(AutoHotkeyPath);
console.log(AcePath);
console.log(DriverPath);
console.log(FakeUserPath);





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