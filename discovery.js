// Require dgram module.
var dgram = require('dgram');
const axios = require("axios")

// Create udp server socket object.
var server = dgram.createSocket("udp4");
var slaveUtils = require("./utils/slave-utils");

// Make udp server listen on port 8089.
server.bind(3001);

// When udp server receive message.
server.on("message", async function (message, address) {
    // Create output message.
    var output = "Udp server receive message : " + message + "\n";
    await slaveUtils.newSlaveSetup(address.address, message);
    axios.get("http://" + address.address + ":8000/ping?device=" + deviceId);
    // Print received message in stdout, here is log console.
    process.stdout.write(output);
});

// When udp server started and listening.
server.on('listening', function () {
    // Get and print udp server listening ip address and port number in log console.
    var address = server.address();
    console.log('UDP Server started and listening on ' + address.address + ":" + address.port);
});