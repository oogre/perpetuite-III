static class Blob extends Contour {
  float[] rgb;
  float[] lab;
  PImage parcel;
  static int MATE = 0;
  static int SHAPE = 1;
  static int IMAGE = 2;
  PApplet parent;

  int type = -1 ;

  private Blob(PApplet parent, final Contour c) {
    super(parent, c.pointMat);
    this.parent = parent;
    this.rgb = new float[]{0, 0, 0, 0};

    Rectangle box = this.getBoundingBox();
    final int x = (int)box.getMinX();
    final int y = (int)box.getMinY();
    final int w = (int)box.getWidth();
    final int h = (int)box.getHeight();
    this.parcel = IMG.get(x, y, w, h);

    this.rgb = colorAverage(this.parcel, new Callback<Pair<Integer, Integer>, Boolean>() {
      @Override
        public Boolean call(Pair<Integer, Integer> p) {
        return containsPoint(p.getKey() + x, p.getValue() + y);
      }
    }
    );
    lab = rgb2lab(rgb);
  }

  public void draw(int mouseX, int mouseY, int shape) {

    PVector cPX = getCenter(false);
    if (shape == 0) {
      parent.noStroke();
      parent.fill(rgb[0], rgb[1], rgb[2], rgb[3]);
      super.draw();
    } else if (shape == 1) { 
      parent.noStroke();
      parent.fill(rgb[0], rgb[1], rgb[2], rgb[3]);
      parent.pushMatrix();
      parent.translate(cPX.x, cPX.y);
      parent.beginShape();
      float r = max((float)getBoundingBox().getWidth(), (float)getBoundingBox().getHeight());
      for (int i = 0; i < type + 3; i ++) {
        float a = i * TWO_PI / (type + 3) + PI;
        float x = r * sin(a);
        float y = r * cos(a);
        parent.vertex(x, y);
      }
      parent.endShape(CLOSE);
      parent.popMatrix();
    } else {
      parent.image(parcel, (float)getBoundingBox().getMinX(), (float)getBoundingBox().getMinY());
    }
    parent.noStroke();
    parent.fill(255);
    parent.ellipse(cPX.x, cPX.y, 5, 5);

    if (containsPoint(mouseX, mouseY)) {
      PVector cMM = getCenter(true);
      parent.noStroke();
      parent.fill(255);
      parent.text(
        "Type : " + type + "\n" +
        "Area : " + area() + "\n" +
        "Circ : " + circularity(this)  + "\n" +
        "X : " + cMM.x  + "\n" +
        "Y : " + cMM.y  + "\n" +
        "Z : " + cMM.z  + "\n", 
        cPX.x, 
        cPX.y-PILL_SIZE
        );
    }
  }
  
  public void setType(int value) {
    type = value;
  }

  private float[] colorAverage(PImage intput, Callback<Pair<Integer, Integer>, Boolean> action) {
    float[] avg = new float[]{0, 0, 0, 0};
    int count = 0;
    intput.loadPixels();
    for (int y = 0; y < intput.height; y ++) {
      for (int x = 0; x < intput.width; x ++) {
        if (!action.call(new Pair<Integer, Integer>(x, y)))continue;
        int i = x + y * this.parcel.width;
        avg[0] += intput.pixels[i] >> 16 & 0xFF;
        avg[1] += intput.pixels[i] >> 8 & 0xFF;
        avg[2] += intput.pixels[i] >> 0 & 0xFF;
        avg[3] += intput.pixels[i] >> 24 & 0xFF;
        count ++;
      }
    }
    avg[0] /= count;
    avg[1] /= count;
    avg[2] /= count;
    avg[3] /= count;
    return avg;
  }

  public PVector getCenter(boolean robot) {
    PVector out = new PVector(
      (float) getBoundingBox().getCenterX(), 
      (float) getBoundingBox().getMinY() + PILL_SIZE/2
      );
    float min = (float)getBoundingBox().getMinX() + PILL_SIZE/2;
    float max = (float)getBoundingBox().getMaxX() - PILL_SIZE/2;
    out.x = lerp(min, max, out.x / IMG.width);  

    if (robot) {
      out.sub(IMG.width/2, IMG.height/2);
      out.y *= -1;
      out.mult(PIX_TO_MM);
    }
    return out;
  }

  private JSONArray getColor() {
    JSONArray c = new JSONArray();
    c.setFloat(0, this.rgb[0]);
    c.setFloat(1, this.rgb[1]);
    c.setFloat(2, this.rgb[2]);
    return c;
  }

  private JSONArray getPositon() {
    PVector cMM = getCenter(true);
    JSONArray position = new JSONArray();
    position.setFloat(0, cMM.x);
    position.setFloat(1, cMM.y);
    position.setFloat(2, cMM.z);
    return position;
  }

  public JSONObject toJson() {
    JSONObject pill = new JSONObject();
    pill.setJSONArray("position", this.getPositon());
    pill.setJSONArray("color", this.getColor());
    return pill;
  }

  public static ArrayList<Blob> Factory(ArrayList<Contour> intput, Callback<Contour, Blob> action) {
    ArrayList<Blob> out = new ArrayList<Blob>();
    for (Contour contour : intput) {
      Blob instance = action.call(contour);
      if (instance != null)out.add(instance);
    }
    return out;
  }

  public static ArrayList<ArrayList<Blob>> Classifier(ArrayList<Blob> blobs) {
    ArrayList<ArrayList<Blob>> out = new ArrayList<ArrayList<Blob>>();
    int typeCounter = 0;
    while (blobs.size() > 0) {
      ArrayList<Blob> list = new ArrayList<Blob>();
      Blob first = blobs.get(0);
      first.setType(typeCounter);
      blobs.remove(0);
      list.add(first);

      Iterator itr = blobs.iterator();
      while (itr.hasNext()) {
        Blob current = (Blob)itr.next();
        if (deltaE(first.lab, current.lab) < 18) {
          list.add(current);
          current.setType(typeCounter);
          itr.remove();
        }
      }
      out.add(list);
      typeCounter++;
    }
    return out;
  }

  private static float circularity(Contour c) {
    float p = perimeter(c);
    return 4 * PI * c.area() / (p * p);
  }

  private static float perimeter(Contour c) {
    PVector last = null;
    float d = 0;
    for (PVector p : c.getPoints()) {
      if (last == null) {
        last = p;
        continue;
      }
      d += PVector.dist(p, last);
      last = p;
    }
    d+= PVector.dist(c.getPoints().get(0), last);
    return d;
  }
}
