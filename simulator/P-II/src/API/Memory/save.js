import fs from 'fs-extra';


export const Memory_save = (BASE)=>{
	const savedAt = new Date().getTime();
	return fs.writeFileSync(
		"./data/memoryStatus",
		BASE.memory.set.filter(pill=>pill.isLock).map(pill=>`${pill.toString()} ${savedAt}`).join("\n"),
		"utf8"
	);
}
