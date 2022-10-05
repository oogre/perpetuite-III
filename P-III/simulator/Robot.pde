
class Robot {
	float x, y, z, w;
	float cam_width;
	float cam_height;
	boolean grab = true;
	
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
		cam_height = cam_width*(1-0.504114891);
		
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
		return 	p.location.x - p.radius > x - cam_width/2 && 
				p.location.x + p.radius < x + cam_width/2 && 
				p.location.y - p.radius > y - cam_height/2 && 
				p.location.y + p.radius < y + cam_height/2;
	}

	PVector worldToPix(PVector world){
		PVector tmp = PVector.sub(world, new PVector(x-camLeft, y+camTop));
		tmp.set(tmp.x * _width/width, tmp.y * -_height/height);
		return tmp;
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
		rect(0, 0, cam_width, cam_height);
		popMatrix();
	}
}