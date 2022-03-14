/*----------------------------------------*\
  oogre_21_22_AN1_clipWeb - client.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-03-08 22:02:44
  @Last Modified time: 2022-03-14 14:28:49
\*----------------------------------------*/
var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

client.on('connectFailed', (error) => {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', (connection) => {
    console.log('WebSocket Client Connected');
    connection.on('error', (error) => {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', () => {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });

    const data = JSON.stringify({
        Data : JSON.stringify({ X : Math.random()*100, Y : Math.random()*100, Z: Math.random()*100 }),
        Action : "Goto"
    });

    console.log(data);
    connection.sendUTF(data);
});

client.connect('ws://localhost:6969/' );
