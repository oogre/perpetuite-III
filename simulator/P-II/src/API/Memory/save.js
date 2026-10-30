import fs from 'fs-extra';


export const Memory_save = (BASE)=>{
	BASE.robot.actionDesc = `Memory save`;
	try{
		const savedAt = new Date().getTime();
		fs.writeFileSync(
			BASE.memory.conf.lockedPillSavePath,
			BASE.memory.set.filter(pill=>pill.isLock).map(pill=>`${pill.toString()} ${savedAt}`).join("\n"),
			"utf8"
		);
		return true;
	}finally{
		BASE.robot.actionDescPop();
	}
}
