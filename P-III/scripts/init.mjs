#!/usr/bin/env zx

const main = async () => {
	console.log("setupParentIP");
	await setupParentIP();

	console.log("isAceRunning");
	const alreadyRunning = await isAceRunning();

	console.log(alreadyRunning);
	if(!alreadyRunning)await runAce();
	await waitForAceServerRunning();
	console.log("runPIII");
	await runPIII();
}

const wait = async t => new Promise(r => setTimeout(()=>r(), t));


const setupParentIP = async () => {
	const {stdout:ipConf} = await $`ipconfig.exe`;
	const HOST_IPV4 = ipConf.split("Ethernet adapter vEthernet (WSL):")[1]
						.split("IPv4")[1]
						.split("\r\n")[0]
						.split(":")[1]
						.trim();
	await $`echo "nameserver ${HOST_IPV4}" > /etc/resolv.conf`;
}

const isAceRunning = async () => {
	let  {stdout:tasks} = await $`tasklist.exe`;
	tasks = tasks.split("\n").filter(line => line.includes("Ace."));
	console.log(tasks);
	return tasks.length != 0;
}

const isPIIIRunning = async () => {
	let  {stdout:tasks} = await $`ps aux`;
	tasks = tasks.split("\n").filter(line => line.includes("P-III.APP"));
	console.log(tasks);
	return tasks.length != 0;
}

const isAceServerRunning = async ()=>{
	const {stdout:openPortList} = await $`netstat.exe -nao`;
	const aceServerStatus = openPortList.split("\n").filter(line => line.includes("0.0.0.0:9090"));
	console.log(aceServerStatus);
	return aceServerStatus.length !=0;
}

const waitForAceServerRunning = async () =>{
	while(! await isAceServerRunning()){
		await wait(1000);
	}
}

const runAce = async () => {
	$`Ace.exe server=ace@43434`;
	await wait(10000);
	$`Ace.exe client datafile="C:/Users/felix/Desktop/perpetuite-III/ACE.3.8/driver.perpetuite3.ace.awp"`;
	
}

const runPIII = async () => {
	await $`P-III`;
}

await main();