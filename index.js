const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/api/users");
const profiles = require("./routes/api/profiles");
const posts = require("./routes/api/posts");

const app = express();

// middleware to handle input-field
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// config DB
const db = require("./configs/key").mongoURI;

// connect db
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("connected DB"))
  .catch((e) => console.log(e));

// passport middleware
app.use(passport.initialize());

// passport config
require("./configs/passport")(passport);

const port = process.env.PORT || 5000;

// Routes middleware
app.use("/api/users", users);
app.use("/api/profiles", profiles);
app.use("/api/posts", posts);

app.listen(port, () => console.log(`port lisiting on ${port}`));
