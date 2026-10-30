
export const Robot_dcc = async (BASE, [value])=>{
	BASE.robot.actionDesc = `Robot dcc`;
	try{
		await BASE.robot.setDeceleration(value);	
		return true;
	}finally{
		BASE.robot.actionDescPop();                   // toujours, une seule fois
	}
}

