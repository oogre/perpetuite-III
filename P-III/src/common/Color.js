/*----------------------------------------*\
  P-III - Color.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-09-29 17:05:39
  @Last Modified time: 2022-10-03 11:02:27
\*----------------------------------------*/

export default class Color {
	constructor(r, g, b){
		this.r = r;
		this.g = g;
		this.b = b;
	}
	equals(other) {
  	return other && this.r == other.r && this.g == other.g && this.b == other.b;
	}
	toArray(){
		return [this.r, this.g, this.b]
	}
	isBlack(){
		return this.equals(new Color(0, 0, 0));
	}
}