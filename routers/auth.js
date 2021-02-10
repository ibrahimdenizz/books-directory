const { User } = require("../models/user");
const Joi = require("joi");
const router = require("express").Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send({ message: error.details[0].message });

  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(404).send({ message: "User not found" });

  const token = user.generateAuthToken();
  try {
    res.status(200).send({ token, name: user.name, email: user.email });
  } catch (error) {
    logger.error(error.message);
    res.status(500).send({ message: "Something goes wrong!" });
  }
});

function validate(user) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).email().required(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(user);
}

module.exports = router;
