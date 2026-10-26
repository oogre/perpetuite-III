import fs from 'fs-extra';


export const Memory_save = (BASE)=>{
	console.log(BASE.memory.set.filter(pill=>!pill.isLock).map(pill=>pill.toString()).join("\n"));

	// return fs.writeFileSync(
	// 	"./data/memoryStatus",
	// 	BASE.memory.set.filter(pill=>!pill.isLock).map(pill=>pill.toString()).join("\n"),
	// 	"utf8"
	// );
}
