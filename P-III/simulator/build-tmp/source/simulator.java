import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import processing.net.*; 
import java.util.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class simulator extends PApplet {



Server_Process server;
Robot robot;
float _width = 1400;
float _height = 1400;
ArrayList<Pill> pills;

PVector s;
public void setup() {
	
	pills = new ArrayList<Pill>();
	for(int i = 0 ; i < 100 ; i ++){
		pills.add(new Pill());
	}
	server = new Server_Process(this);
	robot = new Robot();	
	s = new PVector(width/_width, height/_height);
}

public void draw() {
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
		width/2 + width/_width * (robot.x - robot.camLeft),
		height/2 + height/_height *  (robot.y - robot.camTop),
		20, 20
	);

	// // // translate(-width/_width * (robot.x - robot.camLeft), - height/2 + height/_height *  (robot.y - robot.camTop));
	// for(Pill p : pills){
	
	// 	ellipse(
	// 		width/_width * (p.location.x + robot.camLeft) - width/_width * (robot.x ),
	// 		height/_height *  (p.location.y + robot.camTop) - height/_height *  (robot.y ),
	// 		3, 3
	// 	);
	// }

	

}



class Pill{
	PVector location;
	float radius = 4.5f;
	int [] col;
	Pill(){
		do{
			location = randomPosition();
		}while(!isValid(location));
		
		col = randomColor();
		
	}
	public boolean isValid(PVector loc){
		float r = 2 * radius;
		float rsq = r * r;

		for(Pill p : pills){
			if(PVector.sub(p.location, loc).magSq() < rsq){
				return false;
			}
		}
		return true;
	}

	public int [] randomColor(){
		switch(PApplet.parseInt(random(3))) {
			case 0 : return new int [] {255,0, 0};
			case 1 : return new int [] {0, 0, 255};
			default : return new int [] {255, 255, 0 };
		}
	}

	public PVector randomPosition(){
		return PVector.random2D().mult(random(700));
	}
	public void draw(){
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

	public void draw(PGraphics pg){
		pg.pushMatrix();
		pg.noStroke();
		pg.fill(col[0], col[1], col[2], 255);
		pg.translate(location.x, location.y);
		pg.ellipse(0, 0, 2 * radius, 2 * radius);
		pg.popMatrix();
	}

	public JSONObject toObj(){
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
		cam_width = 319.5f;
		cam_height = 236.5f;
		camLeft = cam_width*0.2855346836419753f;
		camRight = cam_width*(1-0.2855346836419753f);
		camTop = cam_height*0.504114891f;
		camBottom = cam_width*(1-0.504114891f);
		
	}

	public void setLocation(float x, float y, float z, float w ){
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}

	public void gripper(int flag){
		grab = flag == 1;
	}
	public boolean isInsideCamera(Pill p){
		return 	p.location.x - p.radius > x - cam_width/2 + camLeft && 
				p.location.x + p.radius < x + cam_width/2 + camLeft && 
				p.location.y - p.radius > y - cam_height/2 && 
				p.location.y + p.radius < y + cam_height/2;
	}

	public PVector worldToPix(PVector world){

		println(world);
		PVector tmp = world.copy();
		tmp.sub(x, y).add(camLeft, camTop).div(1400).add(1, 1).div(2);


		tmp.set(lerp(0, 2592, tmp.x), lerp(0, 1944, tmp.y));

		// PVector tmp = new PVector(world.x * 2592.0/width , world.y * 1944.0/height);

		// tmp.add((new PVector(2592, 1944)).mult(0.5));


		// PVector tmp = PVector.sub(world, new PVector(x-camLeft, y+camTop));
		
		return tmp;//new PVector(lerp(0, 2592, tmp.x), lerp(0, 1944, tmp.y));
	}

	public void draw(){
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








public interface Runner {
   public String run(String [] args);
}


class Server_Process{
	Server server;
	Map<String, Runner> actions = new HashMap<String, Runner>();
	Server_Process(PApplet parent){
		server = new Server(parent, 9090); 
			actions.put("Go", new Runner() {
				public String run(String [] args) {
					float x = PApplet.parseFloat(args[1].substring(1));
					float y = PApplet.parseFloat(args[2].substring(1));
					float z = PApplet.parseFloat(args[3].substring(1));
					float w = PApplet.parseFloat(args[4].substring(1));
					robot.setLocation(x, y, z, w);
					return "ok"; 
				}
			});
			actions.put("Gripper", new Runner() {
				public String run(String [] args) {
					int flag = PApplet.parseInt(args[1].substring(1));
					robot.gripper(flag);
					return "ok"; 
				}
			}); 
			actions.put("Snap", new Runner() {
				public String run(String [] args) {
					
					PGraphics pg = createGraphics(2592, 1944);
					pg.beginDraw();
					pg.background(0);
					for(Pill p : pills){
						if(robot.isInsideCamera(p)){
							// PVector loc = robot.worldToPix(p.location);
							pg.fill(p.col[0],p.col[1],p.col[2]);
							pg.ellipse(
								map(width/_width * (p.location.x + robot.camLeft) - width/_width * (robot.x ), 0, robot.cam_width/2, 0, 2592) ,
								map(height/_height *  (p.location.y + robot.camTop) - height/_height *  (robot.y ), 0, robot.cam_height/2 * 2592/1944.0f, 0, 1944) ,
								75.611f, 
								75.611f
							);
						}
					}
					pg.endDraw();
					pg.save("/Users/ogre/works/2202/Felix/perpetuite-III/P-III/data/camera.sim.jpg");

					JSONArray json = new JSONArray();
					int i = 0 ; 
					for(Pill p : pills){
						if(robot.isInsideCamera(p)){
							json.setJSONObject(i++, p.toObj());
						}
					}
					println(i);
					return json.toString(); 
				}
			}); 
			actions.put("Follow", new Runner() {
				public String run(String [] args) {
					println("Follow");
					delay(500);
					println("YO");
					return "ok";
				}
			}); 
	}

	public void update(){
		Client thisClient = server.available();
		// If the client is not null, and says something, display what it said
		if (thisClient !=null) {
			String request = thisClient.readString();
			if (request != null) {
				String [] req_ = request.split(" ");
				String actionName = req_[0];
				Runner action = actions.get(actionName);
				String [] params = RemoveItem(req_, 0);
				if(action!=null){
					server.write(action.run(params));
				}else{
					println(actionName);
					server.write("ok");
				}
			} 
		} 
	}
}

public String[] RemoveItem(String[] arr, int n) {
  if (n < arr.length-1) {
    arrayCopy(subset(arr, n+1), 0, arr, n, arr.length-1-n);
  }
  arr = shorten(arr);
  return arr;
}
  public void settings() { 	size( 800, 800, P3D ); }
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "simulator" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
