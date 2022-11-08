#!/usr/bin/env zx



$.verbose = false;

const rebootMinDelay = 10 * 60 * 1000;
const rebootTimeFilePath = `./../data/reboot.timestamp`;
let {stdout:lastBootTime} = await $`cat ${rebootTimeFilePath}`
lastBootTime = parseInt(lastBootTime.replace("\n", ""));
const now = new Date().getTime();
await $`echo ${now} > ${rebootTimeFilePath}`
const durationSinceLastReboot = (now - lastBootTime); // milliseconds
if(durationSinceLastReboot < rebootMinDelay){
	console.log("somethingWentWrong")
}