var dgram = require('dgram');
var client = dgram.createSocket("udp4");
client.bind();
client.setBroadcast(true);
var message = new Buffer("message")
client.send(message, 0, message.length, 3001, "192.168.43.255");