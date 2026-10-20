

export const Camera_isRunning = async (BASE)=>{
	BASE.robot.actionDesc = `Camera is Running ?`;
	
	const result = await BASE.camera.isRunning();

	BASE.robot.actionDescPop();
	return result;
}
