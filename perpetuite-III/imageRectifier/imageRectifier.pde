import javafx.util.Pair;


PImage src;
JSONArray data;

PVector [][] points;
Triple<Integer, Integer, Integer> [] baseMesh;

void setup() {
  src = loadImage("camera.jpg");
  data = loadJSONArray("data.json");


  size(760, 760, P3D);

  int tagCount = data.size();
  int pointCount = tagCount * 4;
  int cellCount = ceil(sqrt(pointCount));
  points = new PVector [cellCount][cellCount];

  baseMesh = new Triple [8] ; 
  baseMesh[0] = new Triple<Integer, Integer, Integer>(0, 1, 8);
  baseMesh[1] = new Triple<Integer, Integer, Integer>(1, 9, 8);
  baseMesh[2] = new Triple<Integer, Integer, Integer>(1, 2, 9); 
  baseMesh[3] = new Triple<Integer, Integer, Integer>(2, 10, 9);
  baseMesh[4] = new Triple<Integer, Integer, Integer>(8, 9, 16);
  baseMesh[5] = new Triple<Integer, Integer, Integer>(9, 17, 16);
  baseMesh[6] = new Triple<Integer, Integer, Integer>(9, 10, 17);
  baseMesh[7] = new Triple<Integer, Integer, Integer>(10, 18, 17);


  for (int i = 0; i < data.size(); i++) {
    JSONObject tag = data.getJSONObject(i); 
    int id = tag.getInt("id");
    JSONArray tl = tag.getJSONArray("topLeft");
    JSONArray tr = tag.getJSONArray("topRight");
    JSONArray br = tag.getJSONArray("bottomRight");
    JSONArray bl = tag.getJSONArray("bottomLeft");

    int x = (id % 4) * 2;
    int y = (id / 4) * 2;
try{
    points[x + 0][y + 0] = new PVector(tl.getInt(0), tl.getInt(1));
    points[x + 1][y + 0] = new PVector(tr.getInt(0), tr.getInt(1));
    points[x + 1][y + 1] = new PVector(br.getInt(0), br.getInt(1));
    points[x + 0][y + 1] = new PVector(bl.getInt(0), bl.getInt(1));
}catch(ArrayIndexOutOfBoundsException e){}
  }
}

Pair<Integer, Integer> decompose(int v) {
  //println(v, new Pair<Integer, Integer>(v%8, v/8));
  return new Pair<Integer, Integer>(v%8, v/8);
}


void draw() {

  //println();
  //scale(0.5);
  //image(src, 0, 0);

  int step = 160;
  int margin = 40;
  for (int y = 0; y < 4; y++) {
    for (int x = 0; x < 4; x++) {
      for (int j = 0; j < baseMesh.length; j++) {


        fill(255, 0, 0);

        if (
          (x == 3 && (j == 2 || j == 3 || j == 6 || j == 7)) ||
          (y == 3 && (j == 4 || j == 5 || j == 6 || j == 7)) ||
          (x == 3 && y == 3 && (j == 6 || j == 7))
          ) {
          continue;
        }
        noStroke();
        beginShape();
        texture(src);
        try {
          Pair<Integer, Integer> p1 = decompose(baseMesh[j].x + x * 2 + y * 16);
          Pair<Integer, Integer> p2 = decompose(baseMesh[j].y + x * 2 + y * 16);
          Pair<Integer, Integer> p3 = decompose(baseMesh[j].z + x * 2 + y * 16);
          
          if(j == 0){
            vertex( (x+0) * step + x * margin, (y+0) * step + y * margin, points[p1.getKey()][p1.getValue()].x, points[p1.getKey()][p1.getValue()].y);
            vertex( (x+1) * step + x * margin, (y+0) * step + y * margin, points[p2.getKey()][p2.getValue()].x, points[p2.getKey()][p2.getValue()].y);
            vertex( (x+0) * step + x * margin, (y+1) * step + y * margin, points[p3.getKey()][p3.getValue()].x, points[p3.getKey()][p3.getValue()].y);
          }
          if(j == 1){
            vertex( (x+1) * step + x * margin, (y+0) * step + y * margin, points[p1.getKey()][p1.getValue()].x, points[p1.getKey()][p1.getValue()].y);
            vertex( (x+1) * step + x * margin, (y+1) * step + y * margin, points[p2.getKey()][p2.getValue()].x, points[p2.getKey()][p2.getValue()].y);
            vertex( (x+0) * step + x * margin, (y+1) * step + y * margin, points[p3.getKey()][p3.getValue()].x, points[p3.getKey()][p3.getValue()].y);
          }
          if(j == 2){
            vertex( (x+1) * step + (x+0) * margin, (y+0) * step + y * margin, points[p1.getKey()][p1.getValue()].x, points[p1.getKey()][p1.getValue()].y);
            vertex( (x+1) * step + (x+1) * margin, (y+0) * step + y * margin, points[p2.getKey()][p2.getValue()].x, points[p2.getKey()][p2.getValue()].y);
            vertex( (x+1) * step + (x+0) * margin, (y+1) * step + y * margin, points[p3.getKey()][p3.getValue()].x, points[p3.getKey()][p3.getValue()].y);
          }
          if(j == 3){
            vertex( (x+1) * step + (x+1) * margin, (y+0) * step + y * margin, points[p1.getKey()][p1.getValue()].x, points[p1.getKey()][p1.getValue()].y);
            vertex( (x+1) * step + (x+1) * margin, (y+1) * step + y * margin, points[p2.getKey()][p2.getValue()].x, points[p2.getKey()][p2.getValue()].y);
            vertex( (x+1) * step + (x+0) * margin, (y+1) * step + y * margin, points[p3.getKey()][p3.getValue()].x, points[p3.getKey()][p3.getValue()].y);
          }
          if(j == 4){
            vertex( (x+0) * step + (x+0) * margin, (y+1) * step + (y+0) * margin, points[p1.getKey()][p1.getValue()].x, points[p1.getKey()][p1.getValue()].y);
            vertex( (x+1) * step + (x+0) * margin, (y+1) * step + (y+0) * margin, points[p2.getKey()][p2.getValue()].x, points[p2.getKey()][p2.getValue()].y);
            vertex( (x+0) * step + (x+0) * margin, (y+1) * step + (y+1) * margin, points[p3.getKey()][p3.getValue()].x, points[p3.getKey()][p3.getValue()].y);
          }
          if(j == 5){
            vertex( (x+1) * step + (x+0) * margin, (y+1) * step + (y+0) * margin, points[p1.getKey()][p1.getValue()].x, points[p1.getKey()][p1.getValue()].y);
            vertex( (x+1) * step + (x+0) * margin, (y+1) * step + (y+1) * margin, points[p2.getKey()][p2.getValue()].x, points[p2.getKey()][p2.getValue()].y);
            vertex( (x+0) * step + (x+0) * margin, (y+1) * step + (y+1) * margin, points[p3.getKey()][p3.getValue()].x, points[p3.getKey()][p3.getValue()].y);
          }
          if(j == 6){
            vertex( (x+1) * step + (x+0) * margin, (y+1) * step + (y+0) * margin, points[p1.getKey()][p1.getValue()].x, points[p1.getKey()][p1.getValue()].y);
            vertex( (x+1) * step + (x+1) * margin, (y+1) * step + (y+0) * margin, points[p2.getKey()][p2.getValue()].x, points[p2.getKey()][p2.getValue()].y);
            vertex( (x+1) * step + (x+0) * margin, (y+1) * step + (y+1) * margin, points[p3.getKey()][p3.getValue()].x, points[p3.getKey()][p3.getValue()].y);
          }
          if(j == 7){
            vertex( (x+1) * step + (x+1) * margin, (y+1) * step + (y+0) * margin, points[p1.getKey()][p1.getValue()].x, points[p1.getKey()][p1.getValue()].y);
            vertex( (x+1) * step + (x+1) * margin, (y+1) * step + (y+1) * margin, points[p2.getKey()][p2.getValue()].x, points[p2.getKey()][p2.getValue()].y);
            vertex( (x+1) * step + (x+0) * margin, (y+1) * step + (y+1) * margin, points[p3.getKey()][p3.getValue()].x, points[p3.getKey()][p3.getValue()].y);
          }
        }
        catch(ArrayIndexOutOfBoundsException e) {
          println("error", x, y, j);
        }
        catch(NullPointerException e) {
          println("error", x, y, j);
        }
        
        endShape();
      }
    }
    save("data/rectified.jpg");
    exit();
  }

  //textSize(24);
  //fill(255, 0, 0);
  //for (y = 0; y < 8; y ++) {
  //  for (x = 0; x < 8; x ++) {
  //    text(x + y * 8, points[x][y].x, points[x][y].y);
  //  }
  //}
}
