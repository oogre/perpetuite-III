
class Robot {
	float x, y, z, w;
	float cam_width;
	float cam_height;
	boolean grab = true;
	float camLeft, camRight, camTop, camBottom;
	Robot(){
		x = 0;
		y = 0;
		z = 0;
		w = 0;
		cam_width = 319.5;
		cam_height = 236.5;
		camLeft = cam_width*0.2855346836419753;
		camRight = cam_width*(1-0.2855346836419753);
		camTop = cam_height*0.504114891;
		camBottom = cam_width*(1-0.504114891);
		
	}

	void setLocation(float x, float y, float z, float w ){
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}

	void gripper(int flag){
		grab = flag == 1;
	}
	boolean isInsideCamera(Pill p){
		return 	p.location.x - p.radius > x - cam_width/2 + camLeft && 
				p.location.x + p.radius < x + cam_width/2 + camLeft && 
				p.location.y - p.radius > y - cam_height/2 && 
				p.location.y + p.radius < y + cam_height/2;
	}

	PVector worldToPix(PVector world){

		println(world);
		PVector tmp = world.copy();
		tmp.sub(x, y).add(camLeft, camTop).div(1400).add(1, 1).div(2);


		tmp.set(lerp(0, 2592, tmp.x), lerp(0, 1944, tmp.y));

		// PVector tmp = new PVector(world.x * 2592.0/width , world.y * 1944.0/height);

		// tmp.add((new PVector(2592, 1944)).mult(0.5));


		// PVector tmp = PVector.sub(world, new PVector(x-camLeft, y+camTop));
		
		return tmp;//new PVector(lerp(0, 2592, tmp.x), lerp(0, 1944, tmp.y));
	}

	void draw(){
		pushMatrix();
		rectMode(CENTER);
		strokeWeight(3);
		if(grab){
			stroke(255, 0, 0);	
		}else{
			noStroke();	
		}
		noFill();
		translate(x, y);
		// rotate(radians(this.w));
		rect(0, 0, 20, 20);
		stroke(255);
		translate(-camLeft, -camTop);
		beginShape();
		vertex(0, 0);
		vertex(cam_width, 0);
		vertex(cam_width, cam_height);
		vertex(0, cam_height);
		endShape(CLOSE);
		popMatrix();
	}
}







