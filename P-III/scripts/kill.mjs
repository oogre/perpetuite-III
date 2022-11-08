#!/usr/bin/env zx


try{
	await $`killall P-III.launcher`;
}catch(e){}

try{
	await $`killall P-III.APP`;
}catch(e){}




try{
	await $`killall Ace.exe`;
	await $`taskkill.exe /IM Ace.exe /F`;
	
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
	await $`taskkill.exe /IM python.exe /F`;
}catch(e){}

