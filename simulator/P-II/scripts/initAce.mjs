#!/usr/bin/env zx

$.verbose = false;


const wait = async t => new Promise(r => setTimeout(()=>r(), t));
const translateAddress = async (address, destination) => {
  const flag = destination === "ubuntu" ? "-u" : "-w"
  return (await $`wslpath ${flag} ${address}`).stdout.trim()
}

const home = os.homedir();
const [AutoHotkeyPath, AcePath, DriverPath, FakeUserPath] = await Promise.all([
  translateAddress('C:/Program Files/AutoHotkey/AutoHotkey.exe', "ubuntu"),
  translateAddress('C:/Program Files (x86)/Omron/ACE 3.8/bin/Ace.exe', "ubuntu"),
  translateAddress(path.join(home, 'perpetuite-III/driver.perpetuite3.ace.awp'), "windows"),
  translateAddress(path.join(home, 'perpetuite-III/simulator/P-II/scripts/fakeUser.ahk'), "windows"),
]);

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
	$`${AcePath} server=ace@43434`;
	await wait(10000);
	$`${AcePath} client datafile=${DriverPath}`;
	await waitForAceReady();
	$`${AcePath} client culture=fr-LU loadui="/Src/Interface Homme Machine"`;
	await $`${AutoHotkeyPath} ${FakeUserPath}`;
}


if(!await isAceRunning())await runAce();

process.exit(0);