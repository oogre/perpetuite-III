import org.apache.commons.io.FilenameUtils;
final String FILE_PATH = "rectified.jpg";
final float rWidth = 182; // millimetre
final float rHeight = 182; // millimetre
final float PIX_TO_MM = rWidth / 760.0;
final float MM_TO_PIX = 760.0 / rWidth;
final float PILL_SIZE = 9 * MM_TO_PIX;

ArrayList<Tag> tags;
PILL_TYPE currentType = PILL_TYPE.BLUE_PILL;
Canvas canvas;
File sourceFile;
void setup() {
  size(760, 760, P3D);
  sourceFile = new File(dataPath(FILE_PATH));
  canvas = new Canvas(loadImage(sourceFile.getAbsolutePath()), new PVector(width, height));
  tags = new ArrayList<Tag>();
  canvas.toDrawAfter(
    new Runnable() {
      public void run() {
        for(Tag tag : tags){
          drawPillShape(tag.pos.x, tag.pos.y, PILL_SIZE, tag.type.getValue());
        }
      }
    }
  );
}

void draw() {
  background(0);
  canvas.draw();
  
  drawRuler(mouseX, mouseY, currentType.getValue());
  drawPillShape(mouseX, mouseY, PILL_SIZE * canvas.getScale(), currentType.getValue());
}

public void drawRuler(float x, float y, int _color){
  noFill();
  stroke(_color);
  line(x, 0, x, mouseY - PILL_SIZE * canvas.getScale());
  line(x, width, x, mouseY + PILL_SIZE * canvas.getScale());

  line(0, y, mouseX - PILL_SIZE * canvas.getScale() , y);
  line(width, y, mouseX + PILL_SIZE * canvas.getScale() , y);
}
public void drawPillShape(float x, float y, float s, int _color){
  noFill();
  stroke(_color);
  ellipse(x, y, s, s);
  // stroke(255, 255, 255, 128);
  // ellipse(x, y, s, s*2);


}

public void mouseWheel(MouseEvent me){
  if(me.isControlDown())
    canvas.moveScale(me.getCount());
  else 
    canvas.moveOffset(me.isShiftDown()?me.getCount():0, me.isShiftDown()?0:me.getCount());
}

public void mouseReleased(MouseEvent me){
  tags.add(new Tag(currentType, canvas.toContex(new PVector(mouseX, mouseY))));
}

public void keyReleased(){
  switch (key){
    case '1': currentType = PILL_TYPE.BLUE_PILL ; break;
    case '2': currentType = PILL_TYPE.RED_PILL ; break;
    case '3': currentType = PILL_TYPE.YELLOW_PILL ; break;
    case 's': buildXml() ; break;
  }
}




