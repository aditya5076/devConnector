const express = require("express");
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const key = require("../../configs/key");
const router = express.Router();
const passport = require("passport");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

router.get("/test", (req, res) => res.json({ msg: "users works" }));

// REGISTER USERS
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // check validation
  if (!isValid) {
    res.status(400).json(errors);
  }

  User.findOne({
    email: req.body.email,
  }).then((user) => {
    if (user) {
      return res.status(404).json({ msg: "email is already registered" });
    }
    const avatar = gravatar.url(req.body.email, {
      size: "200",
      rating: "pg",
      d: "mm",
    });

    // creating new user in DB
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      avatar,
    });

    // hashing entered password
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save()
          .then((user) => res.json({ "new user is": user }))
          .catch((e) => res.status(400).json({ msg: e }));
      });
    });
  });
});

// LOGIN USERS
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // check validation
  if (!isValid) {
    res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email }).then((user) => {
    // check user
    if (!user) {
      errors.email = "not found";
      return res.status(404).json(errors);
    }

    // check password
    bcrypt.compare(password, user.password).then((matched) => {
      if (matched) {
        // res.json({ msg: "logged in" });
        const payload = { id: user.id, name: user.name, email: user.email };

        // sign/make token
        jwt.sign(
          payload,
          key.secretOrPrivateKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              access_token: "Bearer " + token,
            });
          }
        );
        // return;
      } else {
        errors.password = "incorrect password";
        return res.status(400).json(errors);
      }
    });
  });
});

// CURRENT USER
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      email: req.user.email,
      avatar: req.user.avatar,
    });
  }
);

// GET ALL USERS
router.get("/all", (req, res) => {
  const errors = {};
  User.find().then((foundUsers) => {
    if (!foundUsers) {
      errors.users = "there's no users";
      return res.status(404).json(errors);
    }
    res.json(foundUsers);
  });
});

// DELETE USER
router.delete("/", (req, res) => {
  User.findOneAndRemove({ _id: req.user.id })
    .then(() => {
      res.json({ deleted: true });
    })
    .catch((e) => {
      res.status(400).json(e);
    });
});

module.exports = router;
