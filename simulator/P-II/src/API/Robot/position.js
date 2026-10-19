
export const Robot_position = async ({robot})=>{
	robot.actionDesc = `Robot get position`;
	const result = await robot.getPosition();	
	robot.actionDescPop();
	return result;
}

