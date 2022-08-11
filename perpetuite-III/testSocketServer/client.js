// Node.js socket client script
const net = require('net');

// Connect to a server @ port 9898
const client = net.createConnection({ 
  host: "localhost", 
  port: 9090 
}, () => {
  client.write('Go 3 d'+process.argv[2]+' d'+process.argv[3]+' d'+process.argv[4]);
});

client.on('data', (data) => {
  //console.log(data.toString());
  client.end();
});





client.on('end', () => {
  console.log('CLIENT: I disconnected from the server.');
});