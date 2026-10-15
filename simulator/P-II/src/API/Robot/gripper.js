
export const Robot_gripper = async ({robot}, [value])=>{
	robot.actionDesc = `Robot Gripper ${value==1}`;
	await robot.setGripper(value==1);	
	robot.actionDescPop();
	return true;
}

