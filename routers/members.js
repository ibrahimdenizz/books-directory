const auth = require("../middlewares/auth");
const validateObjectId = require("../middlewares/validateObjectId");
const { Member, validate } = require("../models/member");
const logger = require("../utility/logger");

const router = require("express").Router();

router.get("/", auth, async (req, res) => {
  const members = await Member.find();

  res.status(200).send(members);
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (!member) return res.status(404).send({ message: "User not found" });

  res.status(200).send(member);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  let member = await Member.findOne({ studentId: req.body.studentId });

  if (member)
    return res.status(400).send({ message: "Student is already registered" });

  member = new Member({
    ssn: req.body.ssn,
    name: req.body.name,
    address: req.body.address,
    phone: req.body.phone,
  });

  try {
    await member.save();
    res.status(200).send(member);
  } catch (err) {
    logger.error(err.message);
    res.status(500).send({ message: "Something goes wrong" });
  }
});

router.put("/:id", [auth, validateObjectId], async (req, res) => {
  if (!req.user.isAdmin)
    return res.status(403).send({ message: "Access denied" });

  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      {
        ssn: req.body.ssn,
        name: req.body.name,
        address: req.body.address,
        phone: req.body.phone,
      },
      {
        new: true,
      }
    );

    if (!member) return res.status(404).send("Student not found");

    res.status(200).send(member);
  } catch (err) {
    logger.error(err.message);
    res.status(500).send({ message: "Something goes wrong" });
  }
});

router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  if (!req.user.isAdmin)
    return res.status(403).send({ message: "Access denied" });

  try {
    const member = await Member.findByIdAndRemove(req.params.id);
    if (!member) return res.status(404).send({ message: "User not found" });
    res.status(200).send(member);
  } catch (err) {
    logger.error(err.message);
    res.status(500).send({ message: "Something goes wrong" });
  }
});

module.exports = router;
