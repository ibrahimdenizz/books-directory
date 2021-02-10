const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 5,
    maxLength: 55,
    required: true,
  },
  email: {
    type: String,
    minLength: 5,
    maxLength: 255,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minLength: 0,
    required: true,
  },
  isAdmin: Boolean,
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("Users", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(55).required(),
    email: Joi.string().min(5).max(255).email().required(),
    password: Joi.string().min(5).max(255).required(),
    isAdmin: Joi.boolean(),
  });

  return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
