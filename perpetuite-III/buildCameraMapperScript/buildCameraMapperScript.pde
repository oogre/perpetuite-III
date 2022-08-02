final String FILE_PATH = "camera.jpg";
File sourceFile;
Canvas canvas;
ArrayList<Tag> tags;

void setup() {
  size(760, 760, P3D);
  tags = new ArrayList<Tag>();
  
  sourceFile = new File(dataPath(FILE_PATH));
  canvas = new Canvas(loadImage(sourceFile.getAbsolutePath()), new PVector(width, height));
  canvas.toDrawAfter(
    new Runnable() {
      public void run() {
        beginShape();
        stroke(0, 0, 255);
        fill(0, 0, 255, 100);
        
        for(Tag tag : tags){
          vertex(tag.pos.x, tag.pos.y);
        }
        PVector p = canvas.toContex(new PVector(mouseX, mouseY));
        vertex(p.x, p.y);
        endShape();
      }
    }
  );
}

void draw() {
  background(0);
  canvas.draw();
  drawRuler(mouseX, mouseY, color(255, 0,0));
}

public void drawRuler(float x, float y, int _color){
  noFill();
  stroke(_color);
  line(x, 0, x, height);
  line(0, y, width , y);
  PVector p = canvas.toContex(new PVector(x, y));
  fill(255, 0, 0);
  textSize(32);
  text((int)p.x + " " + (int)p.y, x, y);
}

public void mouseWheel(MouseEvent me){
  
  int value = (me.isAltDown() ? 10 : 1) * me.getCount();
  
  if(me.isControlDown())
    canvas.moveScale(value);
  else 
    canvas.moveOffset(me.isShiftDown()?value:0, me.isShiftDown()?0:value);
}

public void mouseReleased(MouseEvent me){
  tags.add(new Tag(canvas.toContex(new PVector(mouseX, mouseY))));
}

public void keyReleased(){
  switch (key){
    case 's': 
      buildScript() ; 
      exit();
      break;
  }
}
