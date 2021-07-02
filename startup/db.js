const mongoose = require("mongoose");
const config = require("config");
const logger = require("../utility/logger");

module.exports = function () {
  const db = config.get("db");

  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
      retryWrites: false,
    })
    .then(() => {
      logger.info("Connected to database");
    });
};
