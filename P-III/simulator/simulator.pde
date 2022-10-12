import processing.net.*;
import java.util.*;
Server_Process server;
Robot robot;
float _width = 1400;
float _height = 1400;
ArrayList<Pill> pills;

PVector s;
void setup() {
	size( 800, 800, P3D );
	pills = new ArrayList<Pill>();
	for(int i = 0 ; i < 100 ; i ++){
		pills.add(new Pill());
	}
	server = new Server_Process(this);
	robot = new Robot();	

	s = new PVector(width/_width, height/_height);
	
}

void draw() {
	server.update();
	background(0);
	pushMatrix();
	translate(width/2, height/2);
	scale(width/_width, height/_height);
	for(Pill p : pills){
		p.draw();
	}
	robot.draw();
	popMatrix();
	fill(255);
	ellipse(
		width/2 + width/_width *  (robot.x - robot.camLeft),
		height/2 + height/_height *  (robot.y - robot.camTop),
		20, 20
	);

}



