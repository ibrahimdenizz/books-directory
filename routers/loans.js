const { Book } = require("../models/book");
const { Loan, validate } = require("../models/loan");
const { Member } = require("../models/member");
const auth = require("../middlewares/auth");
const validateObjectId = require("../middlewares/validateObjectId");
const logger = require("../utility/logger");
const mongoose = require("mongoose");
const router = require("express").Router();

router.get("/", auth, async (req, res) => {
  const loans = await Loan.find();

  res.status(200).send(loans);
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) return res.status(404).send({ message: "Loan not found" });

  loan.return();

  res.status(200).send(loan);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send({ message: error.details[0].message });

  const member = await Member.findById(req.body.memberId);

  if (!member) return res.status(404).send({ message: "Member not found" });

  const book = await Book.findById(req.body.bookId);

  if (!book) return res.status(404).send({ message: "Book not found" });
  if (!book.numberInLibrary)
    return res.status(400).send({ message: "All books were loaned" });

  const loan = new Loan({
    member: {
      _id: member._id,
      name: member.name,
      phone: member.phone,
    },
    book: {
      name: book.name,
      author: book.author,
    },
    loanDays: req.body.loanDays,
  });
  book.numberInLibrary--;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await loan.save({ session });
    await book.save({ session });

    await session.commitTransaction();
    await session.endSession();

    res.status(200).send(loan);
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();

    logger.error(error.message);
    res.status(500).send({ message: "Something went wrong" });
  }
});

router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  if (!req.user.isAdmin)
    return res.status(403).send({ message: "Access Denied" });

  const loan = await Loan.findByIdAndRemove(req.params.id);

  if (!loan) return res.status(404).send({ message: "Loan not found" });

  res.status(200).send(loan);
});

module.exports = router;
