import codeanticode.syphon.*;
import gab.opencv.*;
import java.util.*;

PGraphics canvas;
SyphonClient client;

OpenCV opencv;

ArrayList<Contour> contours;
ArrayList<Contour> polygons;
PImage dst;

int tRed = 90;
int tGreen = 105;
int tBlue = 150;

color target = color(tRed, tGreen, tBlue);


void setup() {
  size(1280, 720, P3D);
  client = new SyphonClient(this);

  opencv = new OpenCV(this, 1920, 1080);
}

void draw() {
  if (client.newFrame()) {
    canvas = client.getGraphics(canvas);
  }
  if (null == canvas) return;
  opencv.loadImage(canvas);
  opencv.gray();
  opencv.threshold(168);
  //println(mouseX);
  dst= opencv.getOutput();
  contours = opencv.findContours();
  image(canvas, 0, 0, width, height);


  pushMatrix();
  scale(2.0f/3.0f);

  Contour largest = null;
  for (Contour contour : contours) {
    if (largest == null || largest.area() < contour.area()) {
      largest = contour;
    }
  }
  if (largest == null) {
    popMatrix();
    return;
  }
  ArrayList<PVector> points = new ArrayList<PVector>(); 
  for (Contour contour : contours) {
    if (contour == largest) continue;
    boolean contains = true;
    for (PVector p : contour.getPoints()) {
      if (!largest.containsPoint((int)p.x, (int)p.y)) {
        contains = false;
        break;
      }
    }
    
    java.awt.Rectangle box = contour.getBoundingBox();
    if (contains && contour.area() > 200 && abs(box.width - box.height) < 10) {
      noFill();
      stroke(255, 0, 0);
      contour.draw();

      points.add(new PVector((float)box.getCenterX(), (float)box.getCenterY()));
    }
  }
  if(points.size()==0){
    popMatrix();
    return;
  }
  ArrayList<PVector> pointsLR = (ArrayList<PVector>)points.clone();
  ArrayList<PVector> pointsTD = (ArrayList<PVector>)points.clone();
  Collections.sort(pointsLR, new ContourLeftRightComparator());
  Collections.sort(pointsTD, new ContourTopDownComparator());

  noFill();
  stroke(0);
  beginShape();
  vertex(pointsLR.get(0).x, pointsLR.get(0).y);
  vertex(pointsTD.get(0).x, pointsTD.get(0).y);
  vertex(pointsLR.get(pointsLR.size()-1).x, pointsLR.get(pointsLR.size()-1).y);
  vertex(pointsTD.get(pointsTD.size()-1).x, pointsTD.get(pointsTD.size()-1).y);
  endShape(CLOSE);


  beginShape();
  texture(canvas);
  vertex(0, 0, pointsLR.get(0).x, pointsLR.get(0).y);
  vertex(128*5, 0, pointsTD.get(0).x, pointsTD.get(0).y);
  vertex(128*5, 108*5, pointsLR.get(pointsLR.size()-1).x, pointsLR.get(pointsLR.size()-1).y);
  vertex(0, 108*5, pointsTD.get(pointsTD.size()-1).x, pointsTD.get(pointsTD.size()-1).y);
  endShape();



  popMatrix();
}

// creates the comparator for comparing stock value
class ContourLeftRightComparator implements Comparator<PVector> {

  // override the compare() method
  public int compare(PVector s1, PVector s2)
  {
    if (s1.x == s2.x)
      return 0;
    else if (s1.x > s2.x)
      return 1;
    else
      return -1;
  }
}

// creates the comparator for comparing stock value
class ContourTopDownComparator implements Comparator<PVector> {

  // override the compare() method
  public int compare(PVector s1, PVector s2)
  {
    if (s1.y == s2.y)
      return 0;
    else if (s1.y > s2.y)
      return 1;
    else
      return -1;
  }
}
