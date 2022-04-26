import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class sketch_220425a extends PApplet {


PImage src;
PVector camLocation;
ArrayList<HanchorPoint> hanchors;
HanchorPoint targetedHanchor;
boolean ctrlDown = false;
boolean mapping = false;
public void setup(){
	src = loadImage("0.jpg");
	
	camLocation = new PVector();
	hanchors = new ArrayList<HanchorPoint>();
	hanchors.add(new HanchorPoint(0, 0));
	hanchors.add(new HanchorPoint(width, 0));
	hanchors.add(new HanchorPoint(width, height));
	hanchors.add(new HanchorPoint(0, height));
}


public void draw(){
	background(0);
	ctrlDown = keyPressed && keyCode == CONTROL;
	if(mapping){
		beginShape();
		texture(src);
		PVector m;
		HanchorPoint currentHanchor;
		currentHanchor = hanchors.get(0);
		m = currentHanchor.toScreen(currentHanchor.loc);
		vertex(0, 0, 0, m.x, m.y);
		currentHanchor = hanchors.get(1);
		m = currentHanchor.toScreen(currentHanchor.loc);
		vertex(width, 0, 0, m.x, m.y);
		currentHanchor = hanchors.get(2);
		m = currentHanchor.toScreen(currentHanchor.loc);
		vertex(width, height, 0, m.x, m.y);
		currentHanchor = hanchors.get(3);
		m = currentHanchor.toScreen(currentHanchor.loc);
		vertex(0, height, 0, m.x, m.y);
		endShape();
	}else{
		pushMatrix();
		translate(camLocation.x, camLocation.y, camLocation.z);
		image(src, 0, 0);
		int id = -1 ; 
		for(HanchorPoint hanchor : hanchors){
			id ++;
			hanchor.update(mouseX, mouseY);
			hanchor.draw();
			if(hanchor.isOver){
				targetedHanchor = hanchor;
			}
		}
		popMatrix();	
	}
	
}

public void keyReleased(){
	if(key == ' '){
		mapping = !mapping;
	}
}

public void mouseWheel(MouseEvent event) {
	if(mapping){

	}else{
		camLocation.z -= event.getCount();		
	}
}

public void mouseDragged(){
	if(mapping){

	}else{
		if (ctrlDown){
			camLocation.x += screenX(mouseX, mouseY) - screenX(pmouseX, pmouseY);
			camLocation.y += screenY(mouseX, mouseY) - screenY(pmouseX, pmouseY);		
		}
		else if(null != targetedHanchor){
			targetedHanchor.loc.x+=screenX(mouseX, mouseY) - screenX(pmouseX, pmouseY);
			targetedHanchor.loc.y+=screenY(mouseX, mouseY) - screenY(pmouseX, pmouseY);
		}	
	}
}

class HanchorPoint{
	public PVector pointer;
	public PVector loc;
	public float diameter = 10;
	public boolean isOver = false;
	HanchorPoint(float x, float y){
		this(x, y, 0);
	}
	HanchorPoint(float x, float y, float z){
		this(new PVector(x, y, z));
	}
	HanchorPoint(PVector loc){
		this.pointer = new PVector(0, 0, 0);
		this.loc = loc;
	}
	private PVector toScreen(PVector p){
		return new PVector(screenX(p.x, p.y, p.z), screenY(p.x, p.y, p.z), screenZ(p.x, p.y, p.z));
	}
	private boolean _isOver(){
		this.isOver = PVector.sub(toScreen(loc), pointer).magSq() < diameter * diameter;
		return this.isOver;
	}
	public void update(float x, float y){
		this.pointer.set(x, y, 0);
		this._isOver();
	}
	public void draw(){
		noStroke();
		fill((!ctrlDown && (this.isOver || targetedHanchor == this))?color(255) : color(255, 0, 0));
		ellipse(this.loc.x, this.loc.y, this.diameter, this.diameter);
	}
}
  public void settings() { 	size(860, 540, P3D); }
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "sketch_220425a" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
