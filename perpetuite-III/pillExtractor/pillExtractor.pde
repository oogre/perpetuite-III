import blobDetection.*;
BlobDetection theBlobDetection;

PImage src;

float rWidth = 182; // millimetre
float rHeight = 182; // millimetre
final float PIX_TO_MM = rWidth / 760.0;
final float MM_TO_PIX = 760.0 / rWidth;


ArrayList <PVector> centers;

void setup() {
  size(760, 760, P3D);
  src = loadImage("./data/rectified.jpg");

  centers = new ArrayList <PVector>();

  theBlobDetection = new BlobDetection(src.width, src.height);
  theBlobDetection.setPosDiscrimination(false);
  theBlobDetection.setThreshold(0.75f);
  theBlobDetection.computeBlobs(src.pixels);

  for (int n=0; n<theBlobDetection.getBlobNb(); n++) {
    Blob b=theBlobDetection.getBlob(n);
    if (b==null)continue;
    PVector center = new PVector(0, 0, 0); 
    float rX = width/(float)b.getEdgeNb();
    float rY = height/(float)b.getEdgeNb();
    for (int m=0; m<b.getEdgeNb(); m++) {
      EdgeVertex eA = b.getEdgeVertexA(m);
      EdgeVertex eB = b.getEdgeVertexB(m);
      if (eA ==null || eB ==null)continue;
      center.add(eA.x * rX, eA.y * rY, 0);
    }
    centers.add(center);
  }
}


void draw() {
  image(src, 0, 0);
  //drawBlobsAndEdges();
  rect(width/2, height/2, 9 * MM_TO_PIX, 9 * MM_TO_PIX );
}
void drawBlobsAndEdges()
{
  noFill();

  for (int n=0; n<theBlobDetection.getBlobNb(); n++) {
    Blob b=theBlobDetection.getBlob(n);
    if (b==null) continue;
    strokeWeight(3);
    stroke(0, 255, 0);
    for (int m=0; m<b.getEdgeNb(); m++) {
      EdgeVertex eA = b.getEdgeVertexA(m);
      EdgeVertex eB = b.getEdgeVertexB(m);

      if (eA ==null || eB ==null)continue;
      line(
        eA.x*width, eA.y*height, 
        eB.x*width, eB.y*height
        );
    }
    
    point(centers.get(n).x, centers.get(n).y);
  }
}
