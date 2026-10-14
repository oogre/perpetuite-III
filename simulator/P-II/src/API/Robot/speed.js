
export const Robot_speed = async (BASE, value)=>{
	BASE.robot.actionDesc = `Robot speed ${value}`;
	await BASE.robot.setSeed(value);	
	BASE.robot.actionDescPop();
	return true;
}

