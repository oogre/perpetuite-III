#!/usr/bin/env zx

const isFloat = (n) => n === +n && n !== (n|0);
const isInteger = (n) => n === +n && n === (n|0);
const isNumber = (n) => isFloat(n) || isInteger(n);
const wait = async (time) => {
  if(isNumber(time)){
    return new Promise(s => setTimeout(()=>s(), time)); 
  }
}


const {stdout} = await $`ipconfig.exe`
const HOST_IPV4 = stdout.split("Ethernet adapter vEthernet (WSL):")[1]
					.split("IPv4")[1]
					.split("\r\n")[0]
					.split(":")[1]
					.trim()


await $`echo "nameserver ${HOST_IPV4}" > /etc/resolv.conf`;
$`Ace.exe server=ace@43434`
await wait(10000);
$`Ace.exe client datafile="C:/Users/felix/Desktop/perpetuite-III/ACE.3.8/driver.perpetuite3.ace.awp"`