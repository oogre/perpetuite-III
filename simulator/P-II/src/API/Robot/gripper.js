
export const Robot_gripper = async ({robot}, value)=>{
	robot.actionDesc = `Robot Gripper ${value}`;
	await robot.setGripper(value);	
	robot.actionDescPop();
	return true;
}

