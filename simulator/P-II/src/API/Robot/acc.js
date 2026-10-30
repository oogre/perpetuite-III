
export const Robot_acc = async (BASE, [value])=>{
	BASE.robot.actionDesc = `Robot acceleration ${value}`;
	try{
		await BASE.robot.setAcceleration(value);	
		return true;
	}finally{
		BASE.robot.actionDescPop();                   // toujours, une seule fois
	}
}

