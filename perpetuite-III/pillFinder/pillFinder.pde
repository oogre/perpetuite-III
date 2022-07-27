import blobDetection.*;
BlobDetection theBlobDetection;

PImage src;

float rWidth = 182; // millimetre
float rHeight = 182; // millimetre
float ratio = rWidth / 760.0;

ArrayList <PVector> centers;

void setup() {
  size(760, 760, P3D);
  src = loadImage("./data/rectified.jpg");

  centers = new ArrayList <PVector>();
  
  theBlobDetection = new BlobDetection(src.width, src.height);
  theBlobDetection.setPosDiscrimination(false);
  theBlobDetection.setThreshold(0.75f);
  theBlobDetection.computeBlobs(src.pixels);

  for (int n=0; n<theBlobDetection.getBlobNb(); n++){
    Blob b=theBlobDetection.getBlob(n);
    if (b==null)continue;
    PVector center = new PVector(0, 0, 0); 
    float rX = width/(float)b.getEdgeNb();
    float rY = height/(float)b.getEdgeNb();
    for (int m=0; m<b.getEdgeNb(); m++){
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
  drawBlobsAndEdges(true, true);
}
void drawBlobsAndEdges(boolean drawBlobs, boolean drawEdges)
{
  noFill();
  Blob b;
  EdgeVertex eA, eB;

  for (int n=0; n<theBlobDetection.getBlobNb(); n++)
  {
    b=theBlobDetection.getBlob(n);

    PVector center = new PVector(0, 0, 0); 

    if (b!=null)
    {
      // Edges
      if (drawEdges)
      {
        strokeWeight(2);
        stroke(0, 255, 0);
        for (int m=0; m<b.getEdgeNb(); m++)
        {

          eA = b.getEdgeVertexA(m);
          eB = b.getEdgeVertexB(m);

          center.add(eA.x/b.getEdgeNb(), eA.y/b.getEdgeNb(), 0);

          if (eA !=null && eB !=null)
            line(
              eA.x*width, eA.y*height, 
              eB.x*width, eB.y*height
              );
        }
        stroke(255, 0, 0);
        println(center);
        point(center.x*width, center.y*height);
      }

      //// Blobs
      //if (drawBlobs)
      //{
      //  strokeWeight(1);
      //  stroke(255, 0, 0);
      //  rect(
      //  b.xMin*width, b.yMin*height, 
      //  b.w*width, b.h*height
      //    );
      //}
    }
  }
}
