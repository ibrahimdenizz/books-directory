const logger = require("./utility/logger");
const express = require("express");
const app = express();

require("./startup/validation")();
require("./startup/db")();
require("./startup/config")();
require("./startup/logging")();
require("./startup/prod")(app);
require("./startup/routes")(app);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  logger.info(`Listening port ${port}`);
});

module.exports = server;
