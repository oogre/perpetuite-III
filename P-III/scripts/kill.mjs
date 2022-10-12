#!/usr/bin/env zx

const shutdown = async () => {
	await $`AutoHotKey "C:/Users/felix/Desktop/shutdown.ahk"`;
}
await shutdown();