class Rect{
	constructor([x, y, w, h]){
		this.left = x;
		this.top = y;
		this.right = x+w;
		this.bottom = y+h;
	}
	intersect(other){
  		return !(	other.left > this.right || 
           			other.right < this.left || 
		           	other.top > this.bottom ||
		           	other.bottom < this.top
		        );
	}

}

export default Rect;