
export const Robot_gripper = async (BASE, value)=>{
	BASE.robot.actionDesc = `Robot Gripper ${value}`;
	await BASE.robot.setGripper(value);	
	BASE.robot.actionDescPop();
	return true;
}

