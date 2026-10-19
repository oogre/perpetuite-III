
export const Robot_acc = async ({robot}, [value])=>{
	robot.actionDesc = `Robot acceleration ${value}`;
	await robot.setAcceleration(value);	
	robot.actionDescPop();
	return true;
}

