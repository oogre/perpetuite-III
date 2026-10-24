import {extractPaths} from "./PathExtractor.js";
import fs from 'fs';


export const PathExtractor = (conf)=>{
	/*
	{
		outFile : PATH_EXTRACTOR_OUTPUT_PATH,
		inFile : GENERATOR_DRAW_PATH
		gap : parseInt(PATH_EXTRACTOR_GAP),
		eps : parseInt(PATH_EXTRACTOR_SIMPLIFY_TOLERANCE_THRESHOLD),
		min : parseInt(PATH_EXTRACTOR_PATH_MIN_LENGTH),
	}
	*/
	return {
		genPath : () => {
			const res = extractPaths(conf.inFile, conf.gap, conf.eps, conf.min);
			fs.writeFileSync(conf.outFile, JSON.stringify(res));
		},
		getPath : ()=>{
			const rawPath = fs.readFileSync(conf.outFile);
			console.log(rawPath);
			return [];
		}
	}
}