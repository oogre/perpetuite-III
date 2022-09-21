#!/usr/bin/env node
const cv = require('opencv4nodejs');

const {RobotPosition_mm} = require('./RobotModel.js');
const {PillsModel} = require('./PillsModel.js');
const {CameraModel} = require('./CameraModel.js');
const red = new cv.Vec(0, 0, 255);


const main = async ([xOff=0, yOff=0]=[])=>{
	await CameraModel.init(xOff, yOff);
	const mode = cv.RETR_LIST;
	const method = cv.CHAIN_APPROX_SIMPLE;
	const contours = CameraModel.mask.findContours(mode, method);
	for(const contour of contours){
		PillsModel.contourToPill(contour);
	}
	await PillsModel.draw(CameraModel.image);
	// console.log(PillsModel.pills.length);

	// console.log(PillsModel.toObject());
	cv.imshow('a window croppedImg', CameraModel.image);
};


(async ()=>{

	while(1){

		// RobotPosition_mm[0]++;
		await main(RobotPosition_mm);
		// while(1){
			const key = cv.waitKey(10)
			const done = key !== -1 && key !== 255;
	    	if (done) {
				break;
			}
		// }
	}
	// cv.destroyAllWindows()
})();

