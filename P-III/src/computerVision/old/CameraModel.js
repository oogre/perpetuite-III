/*----------------------------------------*\
  P-III - CameraModel.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-08 10:30:27
  @Last Modified time: 2022-09-20 14:11:11
\*----------------------------------------*/

class CameraModel{
	constructor(){
		this.isInit = false;
	}
	async init(xOff=0, yOff=0){
		// if(this.isInit)return;
		this.isInit = true;
		this.position = [xOff, yOff];
		this.image = await cv.imreadAsync(process.env.PWD+'/data/2022-09-20_14_05_11_193.jpg');
		this.mask = new cv.Mat(
			this.image.getDataAsArray()
			.map(line => 
				line.map(([r, g, b]) => 
					r + g + b < 90 ? [255] : [0]
				)
			), cv.CV_8UC1
		);
		// await cv.imwriteAsync(process.env.PWD+'/data/2022-09-20_14_05_11_193.mask.jpg', this.mask);
		
	}
}

exports.CameraModel = new CameraModel();