
export const Probes_ground = async ({robot})=>{

	console.log(`Probes ground ${BASE.robot.location4D}`);
	robot.actionDesc = `Probes ground ${value}`;
	await robot.controller.ZProbe(BASE.robot.location4D);	
	robot.actionDescPop();
	return true;
}

