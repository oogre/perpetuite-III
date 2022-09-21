/*----------------------------------------*\
  P-III - Memory.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-08 08:57:01
  @Last Modified time: 2022-09-20 15:35:05
\*----------------------------------------*/

import {promisify, deltaE, lab2rgb} from './../common/tools.js';
import _conf_ from './../common/config.js';

const {Point, Vec3} = require('opencv4nodejs');
const {Pill} = require('./Pill.js');
const {CameraModel} = require('./CameraModel.js');
const clusterize = promisify(require('node-kmeans').clusterize);

const { 
  physical : {
    pill_colors
  }
} = _conf_.HIGH_LEVEL_API_CONF;

class PillsModel{
	constructor(){
		this.pills = [];
	}
	contourToPill(contour){
		if(contour.area < 4000 || contour.area > 6000) return null;
		const pillID = this.pills.findIndex(pill => pill.isIntersect(contour.boundingRect()));
		if(pillID >= 0) return this.pills[pillID]
		const pill = new Pill(contour);
		this.pills.push(pill);
		return pill;
	}
	async draw(canvas){



		// const data = this.pills.map((pill)=>{return [pill.avgCol.x, pill.avgCol.y, pill.avgCol.z]})
		// 			console.log(pill_colors);

		// const culster = (await clusterize(data, {
		// 			k: 3, 
		// 			distance : deltaE
		// 		})).sort((A, B) => A.cluster.length-B.cluster.length);

		// culster[0].color = new Vec3(255, 0, 0);
		// culster[1].color = new Vec3(0, 255, 0);
		// culster[2].color = new Vec3(0, 0, 255);
		
		// for(const groupe of culster){
		// 	groupe.color = new Vec3(...lab2rgb(groupe.centroid));
		// 	console.log(groupe);
			for(const pill of this.pills){
				const {x, y, width:w, height:h} = pill.contour.boundingRect()
				canvas.drawRectangle(
					new Point(x, y),
					new Point(x+w, y+h),
					{ color: new Vec3(...([...pill.color.rgb].reverse())), thickness: 2 }
				);
			}
	}
	toObject(){
		return this.pills.map(pill => {
			return {
				center : pill.getCenter(),
				color : pill.avgCol
			}
		});		
	}
}


exports.PillsModel = new PillsModel();