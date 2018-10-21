const WebSocketServer = require("websocket").server;

const Auth = require("./apis/auth");
const Order = require("./apis/order");

module.exports = server => {
  wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false,
    keepaliveInterval: 10000
  });

  const whitelist = [process.env.ADMIN_URL, process.env.CRWALER_URL, process.env.OWNER_URL, process.env.API_URL];

  function originIsAllowed(origin) {
    if (origin === undefined) return true;
    else if (whitelist.indexOf(origin) !== -1) return true;
    else callback(new Error("Not allowed by CORS"));
  }

  wsServer.on("request", function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log(new Date() + " Connection from origin " + request.origin + " rejected.");
      return;
    }

    createConnection(request, "order", {
      onMessage: async (message, connection) => {
        const data = JSON.parse(message.utf8Data);

        Auth.getShopPermissionByOwner(data.user, data.shop)
          .then(() => {
            connection["user"] = data.user;
            connection["shop"] = data.shop;
          })
          .catch(() => connection.close());
      },
      onPong: (data, connection) => {
        Order.getPushItemForShop(connection.user, connection.shop)
          .then(res => pushOrderMessage(connection, res.id))
          .catch(() => connection.close());
      }
    });
  });
};

const createConnection = (request, protocol, { onMessage, onPong }) => {
  const connection = request.accept(protocol, request.origin);
  connection.on("message", message => onMessage(message, connection));
  connection.on("pong", data => onPong(data, connection));
};

const pushOrderMessage = async (connection, order) => {
  if (order === -1) return null;

  if (connection.connected) {
    const result = await Order.getOrderItem(connection.user, connection.shop, order).catch(err => null);

    if (result) {
      connection.sendUTF(JSON.stringify(result));
      Order.getPushItemForShop(connection.user, connection.shop)
        .then(res => pushOrderMessage(connection, res.id))
        .catch(() => connection.close());
    }
  }
};
