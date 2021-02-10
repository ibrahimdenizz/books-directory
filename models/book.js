const Joi = require("joi");
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
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
  genre: {
    type: String,
    min: 5,
    max: 55,
    required: true,
  },
  numberInLibrary: {
    type: Number,
    min: 0,
    default: 0,
  },
});

const Book = mongoose.model("Books", bookSchema);

function validateBook(book) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    author: Joi.string().min(5).max(55).required(),
    genre: Joi.string().min(5).max(55).required(),
    numberInLibrary: Joi.number().min(0),
  });
  return schema.validate(book);
}

exports.bookSchema = bookSchema;
exports.Book = Book;
exports.validate = validateBook;
