#!/usr/bin/env zx

const {wait} = require("./../release/common/tools.js");

const {stdout} = await $`ipconfig.exe`;

const HOST_IPV4 = stdout.split("Ethernet adapter vEthernet (WSL):")[1]
					.split("IPv4")[1]
					.split("\r\n")[0]
					.split(":")[1]
					.trim();

await $`echo "nameserver ${HOST_IPV4}" > /etc/resolv.conf`;
$`Ace.exe server=ace@43434`;
await wait(10000);

$`Ace.exe client datafile="C:/Users/felix/Desktop/perpetuite-III/ACE.3.8/driver.perpetuite3.ace.awp"`;