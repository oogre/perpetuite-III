

WebsocketClientWrapper wsw;

void setup() {
  wsw = new WebsocketClientWrapper(this, "ws://localhost:6969/");
}

void draw() {
  //wsw.sendMessage("bonjour");
}



void webSocketEvent(String msg) {
  println(msg);
}

public void webSocketConnectEvent(String uid, String ip) {
  println("Client Someone connected", uid, ip);
}
  
public void webSocketDisconnectEvent(String uid, String ip) {
  println("Client Someone disconnected", uid, ip);
}
