
export const Robot_dcc = async ({robot}, [value])=>{
	robot.actionDesc = `Robot deceleration ${value}`;
	await robot.setDeceleration(value);	
	robot.actionDescPop();
	return true;
}

