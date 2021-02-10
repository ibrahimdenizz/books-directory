const mongoose = require("mongoose");
const Joi = require("joi");

const memberSchema = mongoose.Schema({
  ssn: {
    type: String,
    length: 11,
    unique: true,
    required: true,
  },
  name: {
    firstName: {
      type: String,
      minLength: 5,
      maxLength: 55,
      required: true,
    },
    lastName: {
      type: String,
      minLength: 5,
      maxLength: 55,
      required: true,
    },
  },
  address: {
    type: String,
    minLength: 5,
    maxLength: 255,
    required: true,
  },
  phone: {
    type: String,
    minLength: 10,
    maxLength: 50,
    required: true,
  },
});

const Member = mongoose.model("Members", memberSchema);

function validateMember(member) {
  const schema = Joi.object({
    ssn: Joi.string().length(11).required(),
    name: {
      firstName: Joi.string().min(5).max(55).required(),
      lastName: Joi.string().min(5).max(55).required(),
    },
    address: Joi.string().min(5).max(255).required(),
    phone: Joi.string().min(10).max(50).required(),
  });

  return schema.validate(member);
}

exports.memberSchema = memberSchema;
exports.Member = Member;
exports.validate = validateMember;
