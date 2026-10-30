
export const Robot_speed = async (BASE, [value])=>{
	BASE.robot.actionDesc = `Robot speed ${value}`;
	try{
		await BASE.robot.setSeed(value);	
		return true;
	}finally{
		BASE.robot.actionDescPop();                   // toujours, une seule fois
	}
}

