const shutdown = async () => {
	await $`shutdown.exe /f /t 0`;
}


await shutdown();