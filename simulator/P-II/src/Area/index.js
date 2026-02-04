import * as ClipperLib from "js-angusj-clipper"; // es6 / typescript
import { Path2D } from '@napi-rs/canvas';
import PIP from "robust-point-in-polygon";
import polybool from '@velipso/polybool';
import GrahamScan from '@lucio/graham-scan';

let clipper;

ClipperLib.loadNativeClipperLibInstanceAsync(
	ClipperLib.NativeClipperLibRequestedFormat.WasmWithAsmJsFallback
).then(_c=>clipper=_c);

export default class Area {
	constructor(_points=[]){
		this._points = [];
		this._path = new Path2D();
		this.contour = _points;
		this.createdAt = new Date().getTime();
		this._area = 0;
	}
	get contour(){
		return this._points;
	}
	set contour(points){
		if(points.length==0)return;
		this.createdAt = new Date().getTime();
		const grahamScan = new GrahamScan();
		grahamScan.setPoints(points);
		points = grahamScan.getHull();
	
		this._points = points;
		this._path = new Path2D();
		this._area = 0;
		points.forEach(([x, y], id)=>{
			if(id==0){
				this._path.moveTo(x, y);
			}else{
				this._path.lineTo(x, y);
			}
			var addX = x;
			var addY = points[id == points.length-1? 0 : id+1].y;
			var subX = points[id == points.length-1? 0 : id+1].x;
			var subY = y;
			this._area += (addX * addY * 0.5);
			this._area -= (subX * subY * 0.5);
		});
		this._area = Math.abs(this._area);
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

	get area(){
		return this._area;
	}
	set area(value){
		this._area = value;
	}

	inflate(dist){
		if(this._points.length==0)return this;
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
	isHover([x, y]){
		return PIP(this._points, [x, y]) != 1;
	}
	union(other){
		return polybool.union(this.polygon, other.polygon).regions;
	}
	isIntersect(other){
		return this.union(other).length == 1;
	}
}