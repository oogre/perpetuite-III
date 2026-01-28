import Pills from "./../Pills";
import ForbiddenUI from './UI.js';
import {isNumber} from "./../tools/validators.js"


import * as ClipperLib from "js-angusj-clipper"; // es6 / typescript
import { Path2D } from '@napi-rs/canvas';
import PIP from "robust-point-in-polygon";
import polybool from '@velipso/polybool';
import GrahamScan from '@lucio/graham-scan';

let clipper;

ClipperLib.loadNativeClipperLibInstanceAsync(
	ClipperLib.NativeClipperLibRequestedFormat.WasmWithAsmJsFallback
).then(_c=>clipper=_c);


class Area{
	constructor(_points){
		this.contour = _points;
	}
	set contour(points){
		const grahamScan = new GrahamScan();
		grahamScan.setPoints(points);
		points = grahamScan.getHull();

		this._points = points;
		this._path = new Path2D();
		points.forEach(([x, y], id)=>{
			if(id==0){
				this._path.moveTo(x, y);
			}else{
				this._path.lineTo(x, y);
			}
		});
		this._path.closePath();
	}
	get path(){
		return this._path;
	}
	get polygon(){
		return {
			regions: [this._points],
			inverted: false
		}
	}
	isHover([x, y]){
		return PIP(this._points, [x, y]) != 1;
	}
	inflate(dist){
		const scale = 100;
		
		const [offsetted] = clipper.offsetToPaths({
			delta: dist * scale,
			offsetInputs: [{
				data: this._points.map(([x, y])=>({
					x : Math.round(x*scale),
					y : Math.round(y*scale)
				})),
				joinType: ClipperLib.JoinType.Round,
				endType: ClipperLib.EndType.ClosedPolygon
			}]
		});
		this.contour = offsetted.map(({x, y})=>[x/scale, y/scale]);
		return this;
	}
}


export default class Forbidden{
	constructor(conf){
		this.ui = new ForbiddenUI(this);
		this.areas = [];
	}

	async addEach(collection){
		for(const item of collection){
			await this.add(item);
		}
	}
	async add(item){
		const area = new Area(item.contour).inflate(5);
		hasToAdd:{
			for(const other of this.areas){
				const union = polybool.union(area.polygon, other.polygon);
				if(union.regions.length == 1){
					other.contour = union.regions[0];
					break hasToAdd;
				}
			}
			this.areas.push(area);
		}
	}
	isHover(location){
		return this.areas.some(item=>item.isHover([location.x, location.y]));
	}
}

async function offsetPolygon(points, offsetDistance) {
    
}
