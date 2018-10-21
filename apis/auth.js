const request = require("./request");

exports.getShopPermissionByOwner = async (owner, shop) => {
  return request({
    method: "GET",
    url: ["/api/shop", shop, "owner"].join("/"),
    token: owner
  });
};
