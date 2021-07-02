const helmet = require("helmet");
const compression = require("compression");
const express = require("express");

module.exports = function (app) {
  app.use(express.json());
  app.use(helmet());
  app.use(compression());
};
