import websockets.*;


WebsocketServer wss;


void setup() {
  wss = new WebsocketServer(this, 6969, "/");
}

void draw() {
  
  //wsw.sendMessage("bonjour");
}


void webSocketServerEvent(String msg){
 println(msg);
 wss.sendMessage(msg);
 
}

public void webSocketConnectEvent(String uid, String ip) {
  println("Server Someone connected", uid, ip);
}
  
public void webSocketDisconnectEvent(String uid, String ip) {
  println("Server Someone disconnected", uid, ip);
}
