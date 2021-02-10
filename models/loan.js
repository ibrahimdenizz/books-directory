const moment = require("moment");
const Joi = require("joi");
const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
  member: {
    type: new mongoose.Schema({
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
      phone: {
        type: String,
        minLength: 10,
        maxLength: 50,
        required: true,
      },
    }),
    required: true,
  },
  book: {
    type: new mongoose.Schema({
      name: {
        type: String,
        minlength: 3,
        maxlength: 255,
        required: true,
      },
      author: {
        type: String,
        min: 5,
        max: 55,
        required: true,
      },
    }),
    required: true,
  },
  loanDays: {
    type: Number,
    min: 1,
    required: true,
  },
  dateOut: {
    type: Date,
    default: Date.now,
  },
  dateReturned: Date,
  lateFee: {
    type: Number,
    min: 0,
  },
});

loanSchema.methods.return = function () {
  this.dateReturned = Date.now();

  const days = moment().diff(this.dateOut, "days");

  if (days > this.loanDays) this.lateFee = (days - this.loanDays) * 3;
  else this.lateFee = 0;
};

const Loan = mongoose.model("Loans", loanSchema);

function validateLoan(loan) {
  const schema = Joi.object({
    memberId: Joi.objectId().required(),
    bookId: Joi.objectId().required(),
    loanDays: Joi.number().min(1).required(),
  });

  return schema.validate(loan);
}

exports.Loan = Loan;
exports.validate = validateLoan;
