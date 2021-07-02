const users = require("../routers/users");
const auth = require("../routers/auth");
const library = require("../routers/library");
const members = require("../routers/members");
const loans = require("../routers/loans");
const returns = require("../routers/returns");

module.exports = function (app) {
  app.use("/api/library", library);
  app.use("/api/members", members);
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/loans", loans);
  app.use("/api/returns", returns);
};
