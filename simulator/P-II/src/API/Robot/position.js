
export const Robot_position = async ({robot})=>{
	robot.actionDesc = `Robot get position`;
	const result = await robot.getPosition();	
	console.log(result);
	robot.actionDescPop();
	return result;
}

