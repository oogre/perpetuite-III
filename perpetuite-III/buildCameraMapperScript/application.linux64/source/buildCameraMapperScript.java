import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class buildCameraMapperScript extends PApplet {

final String FILE_PATH = "camera.jpg";
File sourceFile;
Canvas canvas;
ArrayList<Tag> tags;

public void setup() {
  
  
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

public void draw() {
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
  if(me.isControlDown())
    canvas.moveScale(me.getCount());
  else 
    canvas.moveOffset(me.isShiftDown()?me.getCount():0, me.isShiftDown()?0:me.getCount());
}

public void mouseReleased(MouseEvent me){
  tags.add(new Tag(canvas.toContex(new PVector(mouseX, mouseY))));
}

public void keyReleased(){
  switch (key){
    case 's': buildScript() ; break;
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
    public Tag(PVector pos){
    this.pos = pos;
  }
}
public void buildScript() {

  String command = "convert camera.jpg -matte -verbose -virtual-pixel transparent -distort Perspective 'TL.x,TL.y 1000,600   BL.x,BL.y 1000,2100   BR.x, BR.y 2500,2100   TR.x,TR.y 2500,600' tmp.png ; convert tmp.png -crop 2650x2650+450+50 out.png ; rm tmp.png"; 

  command = command
    .replace("TL.x", ""+round(tags.get(0).pos.x))
    .replace("TL.y", ""+round(tags.get(0).pos.y))
    .replace("BL.x", ""+round(tags.get(1).pos.x))
    .replace("BL.y", ""+round(tags.get(1).pos.y))
    .replace("BR.x", ""+round(tags.get(2).pos.x))
    .replace("BR.y", ""+round(tags.get(2).pos.y))
    .replace("TR.x", ""+round(tags.get(3).pos.x))
    .replace("TR.y", ""+round(tags.get(3).pos.y));


  String[] list = {command};
  saveStrings("data/convert.sh", list);
  exec("bash", "chmod", "777", "data/convert.sh");
  println(list);
  println("DONE");
}

  public void settings() {  size(760, 760, P3D); }
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "buildCameraMapperScript" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
