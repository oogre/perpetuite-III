

float perimeter(Contour c) {
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

ArrayList<Contour> filter(ArrayList<Contour> intput, Callback<Contour, Boolean> action) {
  ArrayList<Contour> out = new ArrayList<Contour>();
  for (Contour contour : intput) {
    if (action.call(contour))out.add(contour);
  }
  return out;
}

class Blob {
  Contour c;
  float[] rgb;
  float[] lab;
  color col;
  Blob(Contour c, float[] rgb) {
    this.c = c;
    this.rgb = rgb;
    col = color(rgb[0], rgb[1], rgb[2]);
    lab = rgb2lab(rgb);
  }
  void draw() {
    noStroke();
    fill(col);
    c.draw();
  }
  PVector center(boolean robot) {
    
    float _x = (float) c.getBoundingBox().getCenterX() / img.width;
    _x = lerp((float)c.getBoundingBox().getMinX()+ PILL_SIZE/2, (float)c.getBoundingBox().getMaxX()- PILL_SIZE/2, _x);
    
    PVector out = new PVector(_x, (float)c.getBoundingBox().getMinY() + PILL_SIZE/2);
    if (robot) {
      out.sub(img.width/2, img.height/2);
      out.y *= -1;
      out.mult(PIX_TO_MM);
    }
    return out;
  }

  JSONArray getColor() {
    JSONArray c = new JSONArray();
    c.setFloat(0, this.rgb[0]);
    c.setFloat(1, this.rgb[1]);
    c.setFloat(2, this.rgb[2]);
    return c;
  }

  JSONArray getPositon() {
    PVector cntr = this.center(true);
    JSONArray position = new JSONArray();
    position.setFloat(0, cntr.x);
    position.setFloat(1, cntr.y);
    position.setFloat(2, cntr.z * PIX_TO_MM);
    return position;
  }

  JSONObject toJson() {
    JSONObject pill = new JSONObject();
    pill.setJSONArray("position", this.getPositon());
    pill.setJSONArray("color", this.getColor());
    return pill;
  }
}
