import java.util.concurrent.*;
import javafx.util.Callback;
import javafx.util.Pair;
import gab.opencv.*;
import java.awt.Rectangle;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

static final float WIDTH_MM = 1400; // millimetre
static final float HEIGHT_MM = 1400; // millimetre
static final float[] BLACK = rgb2lab(new float[]{2, 2, 2, 255.0});

static float PIX_TO_MM;
static float MM_TO_PIX;
static float PILL_SIZE;
static PImage IMG;

ArrayList<ArrayList<Blob>> famillies;

void setup() {
  size(1200, 1200);

  IMG = loadImage("/Users/ogre/works/2202/Felix/perpetuite-III/perpetuite-III/data/rectified.png");
  PIX_TO_MM = WIDTH_MM / (float)IMG.width;
  MM_TO_PIX = IMG.width / (float)WIDTH_MM;
  PILL_SIZE = 9 * MM_TO_PIX;

  PImage _mask = mask(IMG, BLACK);
  _mask.save("./../data/pill.mask.jpg");
  OpenCV opencv = new OpenCV(this, _mask);
  opencv.gray();

  famillies = new ArrayList<ArrayList<Blob>>();

  final PApplet self = this;

  famillies = Blob.Classifier(Blob.Factory(opencv.findContours(), new Callback<Contour, Blob>() {
    @Override
      public Blob call(Contour contour) {
      float area = contour.area();
      if ( 
        area < 400 ||
        area > 10000 ||
        Blob.circularity(contour) < 0.9
        ) return null;
      return new Blob(self, contour);
    }
  }
  ));

  JSONArray pills = new JSONArray();
  int count = 0;
  for (ArrayList<Blob> familly : famillies) {
    for (Blob blob : familly) {
      pills.setJSONObject(count++, blob.toJson());
    }
  }

  textSize(32);
  textAlign(CENTER, BOTTOM);
}

void draw() {
  drawBackground();
  drawRules();

  scale(height/ (float)IMG.height);
  float r = IMG.height / (float)height;
  int mX = int(mouseX * r);
  int mY = int(mouseY * r);

  for (ArrayList<Blob> familly : famillies) {
    for (Blob blob : familly) {
      blob.draw(mX, mY, Blob.MATE);
    }
  }
}

void drawBackground() {
  background(0);
  stroke(255);
  noFill();
  ellipse(width/2, height/2, height, height);
}

void drawRules() {
  stroke(255, 0, 0);

  line(0, height/2, width, height/2);
  line(width/2, 0, width/2, height);
}
