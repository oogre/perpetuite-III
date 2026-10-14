
export const Robot_acc = async (BASE, value)=>{
	BASE.robot.actionDesc = `Robot acceleration ${value}`;
	await BASE.robot.setAcceleration(value);	
	BASE.robot.actionDescPop();
	return true;
}

