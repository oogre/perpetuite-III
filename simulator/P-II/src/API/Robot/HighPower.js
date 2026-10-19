
export const Robot_HighPower = async ({robot}, [value])=>{
	robot.actionDesc = `Robot High Power ${value}`;
	await robot.setHighPower(value==1);	
	robot.actionDescPop();
	return true;
}

