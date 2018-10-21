const rp = require("request-promise");
const URL = process.env.API_URL;

module.exports = async ({ method, url, token, then, error, body }) =>
  rp({
    method: method,
    uri: URL + url,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "x-access-token": token
    },
    body: {
      ...body
    },
    json: true
  })
    .then(then)
    .catch(error);
