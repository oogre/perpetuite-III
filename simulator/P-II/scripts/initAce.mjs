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


const isPortListening = async (port)=>{
	try{
		await $`netstat.exe -nao | grep -E ":${port} .*LISTENING"`;
		return true;
	}catch(e){
		console.log(e);
		return false;
	}
}

const waitForPort = async (port, timeout=120000)=>{
	const t0 = Date.now();
	while(!await isPortListening(port)){
		if(Date.now() - t0 > timeout) throw new Error(`Port ${port} not ready after ${timeout/1000} s`);
		process.stdout.write(".");
		await wait(500);
		process.stdout.write("\n");
	}
}

const [serverUp, projectUp] = await Promise.all([
	isPortListening(43434),
	isPortListening(9090),
]);

if(!serverUp){
	console.log("Run Ace Server");
	$`${AcePath} server=ace@43434`.nothrow();;
	console.log("Waiting for Ace Server to be ready");
	await waitForPort(43434); 
}else{
	console.log("Ace Server already running");
}

if(!projectUp){
	$`${AcePath} client datafile=${DriverPath}`.nothrow();;
	console.log("Waiting for Ace Controller API to be ready");
	await waitForPort(9090);
	$`${AcePath} client culture=fr-LU loadui="/Src/Interface Homme Machine"`;

	console.log("Unlocking the robot : Fake User");
	await $`${AutoHotkeyPath} ${FakeUserPath}`;
}else{
	console.log("Ace Controller API already running");
}

process.exit(0);