import GridUI from "./UI.js"
import { Vector2 } from './../tools/Vector.js';
import Pills from "./../Pills";


export default class Grid extends Pills{
	constructor(conf){
		super(conf);
		this.ui = new GridUI(this);
		const hCount = Math.round(conf.density * conf.diameter * 1);
		const vCount = Math.round(conf.density * conf.diameter * 1.33);
		const offsetX = conf.diameter / hCount;
		const offsetY = conf.diameter / vCount;
		const getPosition = ([x, y]) => {
			x = ( x + (y%2 == 0 ? 0.5 : 0) ) * offsetX - conf.positionRadius;
			y = y * offsetY - conf.positionRadius
			return new Vector2(x, y);
		}
		this.addEach(
			new Array(vCount * hCount)
				.fill(0)
				.map((_, k) => getPosition([ k % hCount, Math.floor(k / hCount) ]))
				.map(location=> this.createPill({box :[ location.x, location.y]}))
		);
	}
	getRandomCellLocation(){
		return this.getRandom().location;
	}
}