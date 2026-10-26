
export const Memory_removeNotlocked = (BASE)=>{

	return BASE.memory.deleteEach(BASE.memory.set.filter(pill=>!pill.isLock))

	
	
}
