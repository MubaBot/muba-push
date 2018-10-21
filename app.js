require("dotenv").config();

const http = require("http");
const websocket = require("./websocket");

const server = http.createServer(function(request, response) {
  console.log(new Date() + " Received request for " + request.url);
  response.writeHead(404);
  response.end();
});

server.listen(5520, function() {
  console.log(new Date() + " Server is listening on port 3050");
});

websocket(server);
