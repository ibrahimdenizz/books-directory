const auth = require("../middlewares/auth");
const validateObjectId = require("../middlewares/validateObjectId");
const { Book, validate } = require("../models/book");
const logger = require("../utility/logger");
const router = require("express").Router();

router.get("/", async (req, res) => {
  const books = await Book.find();
  try {
    res.status(200).send(books);
  } catch (error) {
    logger.error(error.message);
    res.status(500).send({ message: "Something goes wrong!" });
  }
});

router.get("/:id", validateObjectId, async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book)
    return res
      .status(404)
      .send({ message: "No book with given id was not found" });
  try {
    res.status(200).send(book);
  } catch (error) {
    logger.error(error.message);
    res.status(500).send({ message: "Something goes wrong!" });
  }
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  const bookInDB = await Book.findOne({
    name: req.body.name,
    author: req.body.author,
  });
  if (bookInDB)
    return res.status(400).send({ message: "The book already recorded" });

  const book = new Book({
    name: req.body.name,
    author: req.body.author,
    genre: req.body.genre,
    numberInLibrary: req.body.numberInLibrary,
  });

  try {
    await book.save();
    res.status(200).send(book);
  } catch (error) {
    logger.error(error.message);
    res.status(500).send({ message: "Something goes wrong :)" });
  }
});

router.put("/:id", [auth, validateObjectId], async (req, res) => {
  if (!req.user.isAdmin)
    return res.status(403).send({ message: "Access Denied" });

  const { error } = validate(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        author: req.body.author,
        genre: req.body.genre,
        numberInLibrary: req.body.numberInLibrary,
      },
      {
        new: true,
      }
    );
    if (!book)
      return res
        .status(404)
        .send({ message: "No book  with given id was found" });

    res.status(200).send(book);
  } catch (error) {
    logger.error(error.message);
    res.status(500).send({ message: "Something goes wrong :)" });
  }
});

router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  if (!req.user.isAdmin)
    return res.status(403).send({ message: "Access Denied" });

  const book = await Book.findByIdAndDelete(req.params.id);

  if (!book)
    return res
      .status(404)
      .send({ message: "No book  with given id was found" });

  res.status(200).send(book);
});

module.exports = router;
