
export const Probes_ground = async ({robot})=>{
	robot.actionDesc = `Probes ground ${value}`;
	await robot.controller.ZProbe(BASE.robot.location4D);	
	robot.actionDescPop();
	return true;
}

