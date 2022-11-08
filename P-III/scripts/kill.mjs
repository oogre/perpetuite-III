#!/usr/bin/env zx


try{
	await $`killall P-III.launcher`;
}catch(e){}

try{
	await $`killall Ace.exe`;
}catch(e){}

try{
	await $`killall P-III`;
}catch(e){}

try{
	await $`killall P-III.cv`;
}catch(e){}

try{
	await $`killall P-III.cv.Server`;
}catch(e){}

try{
	await $`killall python.exe`;
}catch(e){}

