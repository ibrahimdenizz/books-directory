const Joi = require("joi");
const mongoose = require("mongoose");
const auth = require("../middlewares/auth");
const { Book } = require("../models/book");
const { Loan } = require("../models/loan");
const logger = require("../utility/logger");
const router = require("express").Router();

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send({ message: error.details[0].message });

  const loan = await Loan.findOne({
    "member._id": req.body.memberId,
    "book._id": req.body.bookId,
  });

  if (!loan) return res.status(404).send({ message: "Loan not found" });

  loan.return();

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Book.findByIdAndUpdate(
      req.body.bookId,
      {
        $inc: { numberInLibrary: 1 },
      },
      {
        session,
        new: true,
      }
    );
    await loan.save({ session });

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

function validate(loan) {
  const schema = Joi.object({
    memberId: Joi.objectId().required(),
    bookId: Joi.objectId().required(),
  });

  return schema.validate(loan);
}

module.exports = router;
