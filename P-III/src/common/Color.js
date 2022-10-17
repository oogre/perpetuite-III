/*----------------------------------------*\
  P-III - Color.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-29 17:05:39
  @Last Modified time: 2022-10-05 10:46:55
\*----------------------------------------*/
import _conf_ from "./config.js";
import LOG from "./Log.js";

const { 
  physical : {
    pill_colors
  }
} = _conf_.HIGH_LEVEL_API_CONF;


export default class Color {
	constructor(r, g, b, withLabel=true){
		this.r = r;
		this.g = g;
		this.b = b;
		if(withLabel){
			this.label = LOG.color(
				pill_colors.find(({color}) => 
					this.equals(new Color(...color, false))
				)?.name || 
				(
					this.isBlack() ? 
						'black' 
					: 
						`(${this.r}, ${this.g}, ${this.b})`
				)
			);
		}
	}
	equals(other) {
  	return other && this.r == other.r && this.g == other.g && this.b == other.b;
	}
	toArray(){
		return [this.r, this.g, this.b]
	}
	toString(){
		return this.label;
	}
	isBlack(){
		return this.r == 0 && this.g == 0 && this.b == 0;
	}
	static Black(){
		return new Color(0, 0, 0);
	}
}