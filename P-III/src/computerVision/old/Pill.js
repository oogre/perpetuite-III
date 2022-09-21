/*----------------------------------------*\
  P-III - Pill.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-08 09:17:40
  @Last Modified time: 2022-09-09 13:56:10
\*----------------------------------------*/
const {Vec, Rect, COLOR_BGR2Lab} = require('opencv4nodejs');
const {CameraModel} = require('./CameraModel.js');
const {RobotPosition_mm, PIX_TO_MM} = require('./RobotModel.js');


const {pointInPoly, rgb2lab, deltaE, lab2rgb} = require('./../common/tools.js');
import _conf_ from './../common/config.js';

const { 
  physical : {
    pill_colors
  }
} = _conf_.HIGH_LEVEL_API_CONF;

class Pill{
	constructor(contour){
		this.contour = contour;
		const bBox_px = contour.boundingRect();
		this.parcel = CameraModel.image.getRegion(bBox_px);
		const pixels = this.parcel.getDataAsArray().flat()
			.filter((pix, id) => 
				pointInPoly({
					x:(bBox_px.x + (id % bBox_px.width)), 
					y:(bBox_px.y + Math.floor(id / bBox_px.width))
				}, this.contour.getPoints())
			);

	  this.avgCol = new Vec(...rgb2lab(pixels.reduce((sum, [B, G, R]) => {
			return sum.add(new Vec(R, G, B));
		},
			new Vec(0, 0, 0)
		).div(pixels.length)));

		[,this.color] = pill_colors.reduce((acc, color)=>{
			const d = deltaE([this.avgCol.x, this.avgCol.y, this.avgCol.z], color.lab);
			if(acc==undefined)return [d, color];
			if(d>acc[0])return acc;
			return [d, color];
		}, []);

		this.bBox_mm = new Rect(
			bBox_px.x * PIX_TO_MM + CameraModel.position[0], 
			bBox_px.y * PIX_TO_MM + CameraModel.position[1], 
			bBox_px.width  * PIX_TO_MM, 
			bBox_px.height * PIX_TO_MM
		);

		console.log(this);
	}
	isIntersect(box, mm=false){
		if(!mm){
			box = new Rect(
				box.x * PIX_TO_MM + CameraModel.position[0], 
				box.y * PIX_TO_MM + CameraModel.position[1], 
				box.width  * PIX_TO_MM, 
				box.height * PIX_TO_MM
			);
		}
		const {height, width} = this.bBox_mm.and(box);
		return height * width > this.bBox_mm.width*this.bBox_mm.height * 0.1;
	}
	getCenter(mm=true){
		return {x : this.bBox_mm.x + this.bBox_mm.width/2, y : this.bBox_mm.y + this.bBox_mm.height/2}
	}
}


exports.Pill = Pill;