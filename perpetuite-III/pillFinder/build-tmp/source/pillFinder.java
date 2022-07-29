import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import org.apache.commons.io.FilenameUtils; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class pillFinder extends PApplet {


final String FILE_PATH = "rectified.jpg";
final float rWidth = 182; // millimetre
final float rHeight = 182; // millimetre
final float PIX_TO_MM = rWidth / 760.0f;
final float MM_TO_PIX = 760.0f / rWidth;
final float PILL_SIZE = 9 * MM_TO_PIX;

ArrayList<Tag> tags;
PILL_TYPE currentType = PILL_TYPE.BLUE_PILL;
Canvas canvas;
File sourceFile;
public void setup() {
  
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

public void draw() {
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
  stroke(255, 255, 255, 128);
  ellipse(x, y, s*2, s*2);


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




class Canvas{
  private PImage img;
  private PVector imgSize;
  public PVector getImgSize(){ return imgSize ; };
  private PVector size;
  private PVector offset;
  private PVector pos;
  private PVector PNull = new PVector(0, 0);
  private PVector POne = new PVector(1, 1);
  private float scale = 1;
  private float _scale = 0;
  private ArrayList<Runnable> runDrawAfter;
  private ArrayList<Runnable> runDrawBefore;
  public float getScale(){ return scale; }
  public PVector getPos(){ return pos; }
  public PVector toContex(PVector pt){ return PVector.mult(pt, _scale).sub(PVector.mult(pos, _scale)); }
  private final float SCALE_FACTOR = 0.001f;
  public Canvas(PImage img, PVector size){
    this.img = img;
    this.imgSize = new PVector(img.width, img.height);
    this.size = size;
    this.offset = new PVector(0,0);
    this.scale = 1.0f;
    this.constrainScaleAndOffset();
    this.runDrawAfter = new ArrayList<Runnable>();
    this.runDrawBefore = new ArrayList<Runnable>();
  }

  public void draw(){
    pushMatrix();
    translate(pos.x, pos.y, pos.z);
    scale(scale);  
    for (Runnable before : this.runDrawBefore) before.run();
    image(img, 0, 0);
    for (Runnable after : this.runDrawAfter) after.run();
    popMatrix();
  }

  public void moveOffset(int x, int y){
    offset.set(
      offset.x - x * SCALE_FACTOR * _scale, 
      offset.y - y * SCALE_FACTOR * _scale
    );
    this.constrainScaleAndOffset();
  }

  public void moveScale(int x){
    scale += x * 0.01f;
    this.constrainScaleAndOffset();
  }
  
  public void toDrawBefore(final Runnable runnable){
    this.runDrawBefore.add(runnable);
  }
  
  public void toDrawAfter(final Runnable runnable){
    this.runDrawAfter.add(runnable);
  }

  private void constrainScaleAndOffset(){
    scale = constrain(scale, 0.1f, 100);
    _scale = 1 / scale;
    offset.set(this.PConstrain(offset, PNull, POne));
    this.computePosition();
  }

  private void computePosition(){
    PVector maxPos = PVector.sub(size, PVector.mult(this.imgSize, scale) );
    PVector minPos = PNull;
    pos = this.PLerp(PNull, maxPos, offset);
  }

  private PVector PConstrain(PVector a, PVector b, PVector c ){
    return new PVector(constrain(a.x, b.x, c.x), constrain(a.y, b.y, c.y), constrain(a.z, b.z, c.z));
  }

  private PVector PLerp(PVector a, PVector b, PVector c){
    return new PVector(lerp(a.x, b.x, c.x), lerp(a.y, b.y, c.y), lerp(a.z, b.z, c.z));
  }
}
public enum PILL_TYPE {
    BLUE_PILL(0xFF0000FF),
    RED_PILL (0xFFFF0000),
    YELLOW_PILL(0xFFFFFF00);


    public final int value;
    public int getValue(){
      return value;
    }
    private PILL_TYPE(int value) {
        this.value = value;
    }
  };

class Tag{
  public PILL_TYPE type = PILL_TYPE.BLUE_PILL;
  public PVector pos;
  public Tag(PILL_TYPE type, PVector pos){
    this.type = type;
    this.pos = pos;
  }
}

public void buildXml(){
  XML xml = parseXML("<annotation verified=\"yes\"></annotation>");
  XML folder = xml.addChild("folder");
  folder.setContent("pillFinder");

  XML filename = xml.addChild("filename");
  filename.setContent(sourceFile.getName());

  XML path = xml.addChild("path");
  path.setContent(sourceFile.getAbsolutePath());

  XML source = xml.addChild("source");
  XML database = source.addChild("database");
  database.setContent("Unknown");
  
  XML size = xml.addChild("size");
  XML width = size.addChild("width");
  width.setContent(""+(int)canvas.getImgSize().x);
  XML height = size.addChild("height");
  height.setContent(""+(int)canvas.getImgSize().y);
  XML depth = size.addChild("depth");
  depth.setContent("3");

  XML segmented = xml.addChild("segmented");
  segmented.setContent("0");
  
  for(Tag tag : tags){
    XML object = xml.addChild("object");

    XML name = object.addChild("name");
    name.setContent("0x"+hex(tag.type.getValue()));

    XML pose = object.addChild("pose");
    pose.setContent("Unspecified");

    XML truncated = object.addChild("truncated");
    truncated.setContent("0");

    XML difficult = object.addChild("difficult");
    difficult.setContent("0");

    XML bndbox = object.addChild("bndbox");

    XML xmin = bndbox.addChild("xmin");
    xmin.setContent(""+(tag.pos.x - PILL_SIZE * 1.5f ));

    XML ymin = bndbox.addChild("ymin");
    ymin.setContent(""+(tag.pos.y - PILL_SIZE * 1.5f));

    XML xmax = bndbox.addChild("xmax");
    xmax.setContent(""+(tag.pos.x + PILL_SIZE * 1.5f));

    XML ymax = bndbox.addChild("ymax");
    ymax.setContent(""+(tag.pos.y + PILL_SIZE * 1.5f));
    
  }
  saveXML(xml, "/"+FilenameUtils.getPath(dataPath(FILE_PATH))+FilenameUtils.getBaseName(dataPath(FILE_PATH))+".labels.xml");
}
  public void settings() {  size(760, 760, P3D); }
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "pillFinder" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
