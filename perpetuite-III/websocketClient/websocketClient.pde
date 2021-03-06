import websockets.*;

WebsocketClient wsc;


void setup() {
  size(650, 650);
  wsc= new WebsocketClient(this, "ws://localhost:6969/");
  
  
  
  
}

void draw() {
  background(255);
  fill(0);
  ellipse(width/2, height/2, 650, 650);
  
   try {
    wsc.sendMessage( 
      Requests.GetToolPosition()
    );
    wsc.sendMessage( 
      Requests.GetToolOffset()
    );
     wsc.sendMessage( 
      Requests.SetToolOffset(
        new PVector(random(-100, 100), random(-100, 100), random(-100, 100))
      ) 
    );
  }catch(IOException e){
    println(e);
  }
  
  delay(1000);
}

void mouseReleased() {
  /*
   try {
    wsc.sendMessage( 
      Requests.goTo(
        new PVector(2*mouseX-width, 2*mouseY-height)
      ) 
    );
  }catch(IOException e){
    println(e);
  }
  */
}

void webSocketEvent(String msg) {
  println(msg);
}
