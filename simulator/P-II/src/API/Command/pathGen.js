import { Vector4 } from './../../tools/Vector.js';

export const Command_pathGen = async (BASE)=>{
	return BASE.cmd.patterGen.pathExtractor.genPath();
}

