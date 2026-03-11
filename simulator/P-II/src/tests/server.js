#!/usr/bin/env node

//Require the net module which comes with NodeJS
const net = require('net');

//Declare the port to which out server will listen
const PORT = 9090;

//Create the server
const server = net.createServer();

//Now let the server know what to do when some client makes a connection
server.on('connection', function(sock) {

    //Logging host:port of the tcp_client that connects
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

    //define the function to run when client sends some data
    sock.on('data', function(data) {

        //log the data
        console.log(`${data}`);
        
        //send some response to client
        sock.write('Hello client from server');
    });

    //define the function to run when client disconnects
    sock.on('end', function() {
        console.log('CONNECTION CLOSED: ' + sock.remoteAddress + ':' + sock.remotePort);
    });

    //also we want to see if some error occurs
    sock.on('error', function(err) {
        console.log(`Error ${sock.remoteAddress}: ${err}`);
    });
});

//now let's start listening for connections
server.listen(PORT, () => {
    console.log('TCP Server is running on port ' + PORT + '.');
});