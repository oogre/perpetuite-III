
export const Robot_gripper = async (BASE, [value])=>{

	BASE.robot.actionDesc = `Robot Gripper${value==1}`;
	try{
		await BASE.robot.setGripper(value==1);	
		return true;
	}finally{
		BASE.robot.actionDescPop();                   // toujours, une seule fois
	}
}

