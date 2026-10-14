
export const Robot_dcc = async (BASE, value)=>{
	BASE.robot.actionDesc = `Robot deceleration ${value}`;
	await BASE.robot.setDeceleration(value);	
	BASE.robot.actionDescPop();
	return true;
}

