const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");
const auth = require("../middlewares/auth");
const router = require("express").Router();

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) return res.status(400).send({ message: "Invalid token" });

  res.status(200).send(user);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send({ message: error.details[0].message });

  const userInDb = await User.findOne({ email: req.body.email });

  if (userInDb)
    return res.status(400).send({ message: "User is already registered" });

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: password,
  });

  const token = user.generateAuthToken();

  try {
    await user.save();
    res.status(200).send({ token });
  } catch (error) {
    logger.error(error.message);
    res.status(500).send({ message: "Something goes wrong" });
  }
});

module.exports = router;
