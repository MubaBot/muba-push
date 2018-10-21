const request = require("./request");

exports.getPushItemForShop = async (owner, shop) => {
  return request({
    method: "GET",
    url: ["/api/shop", shop, "order", "push"].join("/"),
    token: owner
  });
};

exports.getOrderItem = async (owner, shop, order) => {
  return request({
    method: "GET",
    url: ["/api/shop", shop, "order", order, "info"].join("/"),
    token: owner
  });
};
