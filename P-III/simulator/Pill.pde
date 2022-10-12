class Pill{
	PVector location;
	float radius = 4.5;
	int [] col;
	Pill(){
		do{
			location = randomPosition();
		}while(!isValid(location));
		
		col = randomColor();
		
	}
	boolean isValid(PVector loc){
		float r = 2 * radius;
		float rsq = r * r;

		for(Pill p : pills){
			if(PVector.sub(p.location, loc).magSq() < rsq){
				return false;
			}
		}
		return true;
	}

	int [] randomColor(){
		switch(int(random(3))) {
			case 0 : return new int [] {255,0, 0};
			case 1 : return new int [] {0, 0, 255};
			default : return new int [] {255, 255, 0 };
		}
	}

	PVector randomPosition(){
		return PVector.random2D().mult(random(700));
	}
	void draw(){
		pushMatrix();
		noStroke();
		if(robot.isInsideCamera(this)){
			fill(col[0], col[1], col[2], 255);
		}else{
			fill(col[0], col[1], col[2], 64);
		}
		translate(location.x, location.y);
		ellipse(0, 0, 2 * radius, 2 * radius);
		popMatrix();
	}

	void draw(PGraphics pg){
		pg.pushMatrix();
		pg.noStroke();
		pg.fill(col[0], col[1], col[2], 255);
		pg.translate(location.x, location.y);
		pg.ellipse(0, 0, 2 * radius, 2 * radius);
		pg.popMatrix();
	}

	JSONObject toObj(){
  		JSONObject json = new JSONObject();
  		JSONArray center = new JSONArray();
  		PVector pixLoc = robot.worldToPix(location);
  		center.setFloat(0, pixLoc.x);
  		center.setFloat(1, pixLoc.y);
  		json.setJSONArray("center", center);
  		JSONArray avgRGB = new JSONArray();
  		avgRGB.setInt(0, col[0]);
  		avgRGB.setInt(1, col[1]);
  		avgRGB.setInt(2, col[2]);
  		json.setJSONArray("avgRGB", avgRGB);
  		JSONArray box = new JSONArray();
  		box.setFloat(0, pixLoc.x);
  		box.setFloat(1, pixLoc.y);
  		box.setFloat(2, radius*2);
  		box.setFloat(3, radius*2);
  		json.setJSONArray("box", box);
  		return json;
    }
}