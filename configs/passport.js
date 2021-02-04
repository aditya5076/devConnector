// CREATING STRATEGY
const jwtStrategy = require("passport-jwt").Strategy;
const extractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const User = mongoose.model("users");
const key = require("../configs/key");

const opts = {};
opts.jwtFromRequest = extractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = key.secretOrPrivateKey;

module.exports = (passport) => {
  passport.use(
    new jwtStrategy(opts, (jwt_payload, done) => {
      //   console.log(jwt_payload);
      User.findById(jwt_payload.id)
        .then((userFound) => {
          if (userFound) {
            return done(null, userFound);
          }
          return done(null, false);
        })
        .catch((e) => console.log(e));
    })
  );
};
