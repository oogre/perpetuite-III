#!/usr/bin/env zx
// $.verbose = false;


// try{
// 	await $`killall P-III.launcher`;
// }catch(e){}

try{
	await $`killall P-III.APP`;
}catch(e){}

// try{
// 	await $`killall Ace.exe`;
// }catch(e){}

// try{
// 	await $`taskkill.exe /IM Ace.exe /F`;
	
// }catch(e){}

try{
	await $`killall P-III.cv`;
}catch(e){}

try{
	await $`killall P-III.cv.Server`;
}catch(e){}

try{
	await $`killall python.exe`;
}catch(e){}

try{
	await $`taskkill.exe /IM python.exe /F`;
}catch(e){}



// try{
// 	await $`shutdown.exe -s -t 00 -f`;
// }catch(e){}

process.exit(0);