
export const Robot_HighPower = async (BASE, [value])=>{
	BASE.robot.actionDesc = `Robot HighPower ${value==1}`;
	try{
		await BASE.robot.setHighPower(value==1);	
		return true;
	}finally{
		BASE.robot.actionDescPop();                   // toujours, une seule fois
	}
}

