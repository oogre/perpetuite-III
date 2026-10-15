
export const Robot_speed = async ({robot}, [value])=>{
	robot.actionDesc = `Robot speed ${value}`;
	await robot.setSeed(value);	
	robot.actionDescPop();
	return true;
}

