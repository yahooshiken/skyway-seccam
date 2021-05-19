const auth = require("static-auth");
const safeCompare = require("safe-compare");

const app = auth(
  "/",
  (username, password) =>
    safeCompare(username, process.env.USERNAME) &&
    safeCompare(password, process.env.PASSWORD),
  {
    directory: `${__dirname}/dist`,
    onAuthFailed: (res) => {
      res.end("Authentication failed");
    },
  }
);

module.exports = app;
