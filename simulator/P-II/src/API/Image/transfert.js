
export const Image_transfert = async ({image})=>{
	await image.transportImageFromSourceToDest();	
	return true;
}