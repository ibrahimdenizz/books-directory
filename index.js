const users = require("./routers/users");
const auth = require("./routers/auth");
const library = require("./routers/library");
const members = require("./routers/members");
const loans = require("./routers/loans");
const returns = require("./routers/returns");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const config = require("config");
const helmet = require("helmet");
const logger = require("./utility/logger");
const compression = require("compression");
const mongoose = require("mongoose");
const express = require("express");
const app = express();

require("express-async-errors");

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
    logger.info("Connected to databese");
  });

if (!config.get("jwtPrivateKey")) {
  throw new Error("FATAL ERROR -- JWT is not defined");
}
process.on("unhandledRejection", (ex) => {
  throw ex;
});

app.use(express.json());
app.use(helmet());
app.use(compression());
app.use("/api/library", library);
app.use("/api/members", members);
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/loans", loans);
app.use("/api/returns", returns);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  logger.info(`Listenning port ${port}`);
});

module.exports = server;
