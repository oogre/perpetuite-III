import java.util.concurrent.*;
import javafx.util.Callback;
import gab.opencv.*;
import java.awt.Rectangle;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
OpenCV opencv;

ArrayList<ArrayList<Blob>> famillies;
PImage img;
ArrayList<Contour> contours;
ArrayList<Blob> blobs;

final float rWidth = 1400; // millimetre
final float rHeight = 1400; // millimetre
final float PIX_TO_MM = rWidth / 2671.0;
final float MM_TO_PIX = 2671.0 / rWidth;
final float PILL_SIZE = 9 * MM_TO_PIX;

float[] BLACK = rgb2lab(new float[]{2, 2, 2, 255.0});

int countBluePill = 0;
int countYellowPill = 0;
int countRedPill = 0;

void setup() {
  size(1200, 1200);
  img = loadImage("/Users/ogre/works/2202/Felix/perpetuite-III/perpetuite-III/buildCameraMapperScript/rectified.png");
  PImage _mask = mask(img, BLACK);
  background(255);
  int s = 1000;
  image(_mask, 0*s, 0*s, s, s);
  opencv = new OpenCV(this, _mask);
  opencv.gray();

  blobs = new ArrayList<Blob>();
  famillies = new ArrayList<ArrayList<Blob>>();
  contours = filter(opencv.findContours(), new Callback<Contour, Boolean>() {
    @Override
      public Boolean call(Contour contour) {
      float area = contour.area();
      if ( area < 300 || area >10000) return false;
      float perimeter = perimeter(contour);
      float circularity = 4 * PI * area / (perimeter * perimeter);
      if ( circularity < 0.5) return false;
      return true;
    }
  }
  );

  for (Contour contour : contours) {
    float [] avg = new float[]{0, 0, 0, 0};
    int count = 0;
    Rectangle box = contour.getBoundingBox();
    for (int y = (int)box.getMinY(); y <= box.getMaxY(); y ++) {
      for (int x = (int)box.getMinX(); x <= box.getMaxX(); x ++) {
        if (!contour.containsPoint(x, y))continue;
        int i = x + y * img.width;
        avg[0] += img.pixels[i] >> 16 & 0xFF;
        avg[1] += img.pixels[i] >> 8 & 0xFF;
        avg[2] += img.pixels[i] >> 0 & 0xFF;
        avg[3] += img.pixels[i] >> 24 & 0xFF;
        count ++;
      }
    }
    avg[0] /= count;
    avg[1] /= count;
    avg[2] /= count;
    avg[3] /= count;
    blobs.add(new Blob(contour, avg));
  }

  int k = 0;
  while (blobs.size() > 0) {
    k++;
    famillies.add(new ArrayList<Blob>());
    ArrayList<Blob> familly = famillies.get(famillies.size()-1);
    int id = (int)random(blobs.size());
    Blob _selected = blobs.get(id);
    blobs.remove(id);
    familly.add(_selected);
    Iterator itr = blobs.iterator();
    while (itr.hasNext()) {
      k++;
      Blob current = (Blob)itr.next();
      float d = deltaE(_selected.lab, current.lab);
      if (d < 15) {
        familly.add(current);
        itr.remove();
      }
    }
  }
  background(255);
  scale(height/(float)img.height);

  JSONArray pills = new JSONArray();
  int count = 0;
  for (ArrayList<Blob> blobs : famillies) {
    for (Blob blob : blobs) {
      pills.setJSONObject(count++, blob.toJson());
    }
  }
  println(pills);
  textSize(32);
  textAlign(CENTER, BOTTOM);
}

void draw() {

  background(255);
  fill(0);
  ellipse(width/2, height/2, height, height);
  stroke(255, 0 ,0);
  line(0, height/2, width, height/2);
  line(width/2, 0, width/2, height);
  noStroke();
  
  scale(height/(float)img.height);
  
  
  float r = img.height / (float)height;
  int mX = int(mouseX * r);
  int mY = int(mouseY * r);
  int famillyCount = 0;
  for (ArrayList<Blob> blobs : famillies) {
    famillyCount++;
    for (Blob blob : blobs) {
      blob.draw();
      PVector center = blob.center(false);
      fill(255);
      ellipse(center.x, center.y, 5, 5);
      if (blob.c.containsPoint(mX, mY)) {
        PVector c = blob.center(true);
        fill(255);
        text(
          "("+(int)c.x + ", " + (int)c.y+")\n"+famillyCount, 
          center.x, 
          center.y-PILL_SIZE
          );
      }
    }
  }
}

public PImage mask(PImage input, float[] alpha) {
  PImage out = createImage(input.width, input.height, ARGB);
  input.loadPixels();
  for (int i = 0; i < input.pixels.length; i ++) {
    float[] CURRENT = rgb2lab(new float[]{
      input.pixels[i]>> 16 & 0xFF, 
      input.pixels[i]>> 8 & 0xFF, 
      input.pixels[i]>> 0 & 0xFF, 
      input.pixels[i]>> 24 & 0xFF 
      });

    float d4 = deltaE(CURRENT, alpha);

    if (CURRENT[3] == 0 || d4 < 20 ) {
      out.pixels[i] = color(255);
    } else {
      out.pixels[i] = color(0);
    }
  }
  out.updatePixels();
  return out;
}
