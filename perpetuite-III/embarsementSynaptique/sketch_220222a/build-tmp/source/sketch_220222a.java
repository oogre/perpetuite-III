import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import java.util.Collections; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class sketch_220222a extends PApplet {

//int resolution = 100;
//ArrayList<Pill> pills;
HexaGrid grid;
PGraphics pg;

public void setup(){
	


	// pg = createGraphics(width, height);
	grid = new HexaGrid(width/2, height/2, width, width/260);
	grid.addChannel(color(255, 150, 200), grid.cells.size()/10);
	grid.addChannel(color(200, 255, 255), grid.cells.size()/10);
	grid.addChannel(color(255, 200, 150), grid.cells.size()/10);
	// grid.addChannel(color(255), grid.cells.size()/10);
	
}

public void draw(){
	background(0);	
	grid.draw();
}


/*
pillCount = cells.size()/10;

		Collections.shuffle(cells);
		for(int i = 0 ; i < pillCount ; i++){
			cells.get(i).pill = new Pill(cellSize, color(255, 0, 0));
		}

		Collections.shuffle(cells);	
		for(int i = 0 ; i < pillCount ; i++){
			while(true){
				HexaCell randomCell = cells.get((int)random(cells.size()));
				if(randomCell.pill == null){
					randomCell.pill = new Pill(cellSize, color(255));
					break;
				}
			}
		}


		*/

class HexaGrid{
	PVector pos;
	float diameter;
	ArrayList<HexaCell> cells;
	ArrayList<Integer> channels;
	PImage oldSrc;
	HexaGrid(float x, float y, float diameter, float cellSize){
		this.pos = new PVector(x, y);
		this.diameter = diameter;
		cells = new ArrayList<HexaCell>();
		channels = new ArrayList<Integer>();
		float cellStep = sqrt(3 * pow(cellSize, 2) / 4);
		for (float py = y - diameter/2 ; py < y + diameter/2; py += 2*cellStep) {
			for (float px = x - diameter/2; px < x + diameter/2; px += 3*cellSize) {
				HexaCell cellA = new HexaCell(px, py, cellSize);
				if(isInside(cellA)){
		 			cells.add(cellA);
		 		}	
		 		HexaCell cellB = new HexaCell(px + 1.5f * cellSize, py + cellStep, cellSize);
		 		if(isInside(cellB)){
		 			cells.add(cellB);
		 		}	
			}
		}
		oldSrc = createImage(ceil(diameter), ceil(diameter), RGB);
	}
	public boolean isInside(HexaCell cell){
		return PVector.dist(pos, cell.pos) + cell.diameter/2 <= diameter/2;
	}
	public void display(PImage src){
		PImage resized = src.copy();
		resized.resize(oldSrc.width, oldSrc.height);
		
		oldSrc = src.copy();
	}
	public void draw(){
		for(HexaCell cell : cells){
			cell.draw();
		}
	}
	public void addChannel(int col, int pixelCount){
		if(!channels.contains(col)){
			channels.add(col);
		}
		for(int i = 0 ; i < pixelCount ; ){
			HexaCell randomCell = cells.get((int)random(cells.size()));
			if(randomCell.pill == null){
				randomCell.pill = new Pill(col);
				i ++;
			}
		}
	}
}

class Pill{
	int col;
	Pill(int col){
		this.col = col;
	}
}

class HexaCell{
	PVector pos;
	float diameter;
	Pill pill;
	HexaCell(float x, float y, float diameter){
		this.pos = new PVector(x, y);
		this.diameter = diameter;
	}
	public void draw(){
		if(pill == null)return;
		fill(pill.col);
		noStroke();
		ellipse(pos.x, pos.y, diameter, diameter);
	}
}





/*
class Hexagrid{
	ArrayList<HexaCell> cells;
	ArrayList<Integer> channels;
	float diameter;
	PVector center;
	int pillCount;
	int [][] screen;

	Hexagrid(float x, float y, float diameter, float cellSize){
		cells = new ArrayList<HexaCell>();
		this.diameter = diameter;
		center = new PVector(x, y);
		int yCount = 0;
		int xCount = 0;
		float cellStepX = cellSize * 1.01;
		float cellStepY = cellSize * 0.9;
		for(float py = y - diameter/2 ; py < y + diameter/2 ; py += cellStepY){
			xCount = 0;
			for(float px = x - diameter/2 ; px < x + diameter/2 ; px += cellStepX){
				float xOffset = 0;
		 		if ((yCount)%2 == 1){
		 			xOffset = cellStepX / 2 ;
		 		}
		 		HexaCell cell = new HexaCell(px + xOffset, py, cellSize, xCount, yCount);
		 		if(isInside(cell)){
		 			cells.add(cell);
		 		}
		 		xCount ++;
			}
			yCount++;
		}
		channels = new ArrayList<Integer>();
		screen = new int[xCount][yCount];
	}
	boolean isInside(HexaCell cell){
		return PVector.dist(center, cell.pos) + cell.diameter/2 <= diameter/2;
	}
	void draw(){
		pushMatrix();
		translate(center.x, center.y);
		fill(0);
		noStroke();
		ellipse(0, 0, diameter, diameter);
		popMatrix();
		for(HexaCell cell : cells){
			cell.draw();
		}
	}
	void addChannel(int pixelCount, color col){
		if(!channels.contains(col)){
			channels.add(col);
		}
		int channelID = channels.indexOf(col)+1;
		for(int i = 0 ; i < pixelCount ; ){
			HexaCell randomCell = cells.get((int)random(cells.size()));
			if(null == randomCell.pill){
				randomCell.pill = new Pill(randomCell.diameter, col);
				screen[randomCell.idX][randomCell.idY] = channelID;
				i ++;
			}
		}
	}
}

class HexaCell{
	PVector pos;
	int idX;
	int idY;
	Pill pill;
	float diameter;
	HexaCell(float x, float y, float diameter, int idX, int idY){
		this.idX = idX;
		this.idY = idY;
		this.diameter = diameter;
		pos = new PVector(x, y);
	}

	void draw(){
		if(pill != null){
			pushMatrix();
			translate(pos.x, pos.y);
			pill.draw();
			popMatrix();
		}
	}
}


class Pill{
	color c;
	float diameter;
	Pill(float diameter, color c){
		this.c = c;
		this.diameter = diameter;
	}
	void draw(){
		noStroke();
		fill(this.c);
		ellipse(0, 0, this.diameter, this.diameter);
	}
}
*/
  public void settings() { 	size(1000, 1000); }
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "sketch_220222a" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
