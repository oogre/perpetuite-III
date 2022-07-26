PImage src;
JSONArray data;

ArrayList<Corner> corners;
ArrayList<Tag> tags;

void setup() {
  src = loadImage("camera.jpg");
  data = loadJSONArray("data.json");

  corners = new ArrayList<Corner>();
  tags = new ArrayList<Tag>();
  corners.add(new Corner(0));
  corners.add(new Corner(11));
  corners.add(new Corner(3));
  corners.add(new Corner(10));

  size(1024, 668);

  for (int i = 0; i < data.size(); i++) {

    JSONObject tag = data.getJSONObject(i); 
    int id = tag.getInt("id");
    JSONArray bl = tag.getJSONArray("bottomLeft");
    JSONArray br = tag.getJSONArray("bottomRight");
    JSONArray tl = tag.getJSONArray("topLeft");
    JSONArray tr = tag.getJSONArray("topRight");
    boolean flag = false;
    for (Corner current : corners) {
      if (current.id == id) {
        current.BL = new PVector(bl.getInt(0), bl.getInt(1));
        current.TL = new PVector(tl.getInt(0), tl.getInt(1));
        current.BR = new PVector(br.getInt(0), br.getInt(1));
        current.TR = new PVector(tr.getInt(0), tr.getInt(1));
        flag = true;
      }
    }
    if(!flag){
      tags.add(new Tag(id, tl.getInt(0), tl.getInt(1), tr.getInt(0), tr.getInt(1), br.getInt(0), br.getInt(1), bl.getInt(0), bl.getInt(1)));
    }
  }
}

void draw() {
  
  
  scale(0.25);
  image(src, 0, 0);
   for (Corner current : corners) {
   current.draw();
   current.drawId();
   }
   
   for (Tag current : tags) {
   current.draw();
   current.drawId();
   }
  
}
