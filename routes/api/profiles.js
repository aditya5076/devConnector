const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

// load validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

router.get("/test", (req, res) => res.json({ msg: "profile works" }));

// GET ALL PROFILES
router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("user", ["name", "email"])
    .then((foundProfiles) => {
      if (!foundProfiles) {
        errors.profiles = "there's no profiles";
        return res.status(404).json(errors);
      }
      res.json(foundProfiles);
    });
});

// GET SINGLE PROFILE
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      // GETTING USER'S DETAILS
      .populate("user", ["name", "avatar"])
      .then((profile) => {
        if (!profile) {
          errors.profile = "There's no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch((e) => res.status(404).json(e));
  }
);

// GET HANDLE USING URL
router.get("/handle/:handle", (req, res) => {
  const error = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "email"])
    .then((foundProfile) => {
      if (!foundProfile) {
        error.handle = "handle not found";
        res.status(404).json(error);
      }
      res.json(foundProfile);
    });
});

// GET USER USING URL'S USR'S ID
router.get("/user/:user_id", (req, res) => {
  const error = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "email"])
    .then((foundProfile) => {
      if (!foundProfile) {
        error.user = "user not found";
        res.status(404).json(error);
      }
      res.json(foundProfile);
    })
    .catch((e) => res.status(404).json({ error: `user not exist` }));
});

// CREATE AND EDIT PROFILES
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //   VALIDATION
    const { errors, isValid } = validateProfileInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    // const errors = {};
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;

    //   skill->split into an array
    if (typeof req.body.skills !== undefined) {
      profileFields.skills = req.body.skills.split(",");
    }

    // socials->object
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then((foundProfile) => {
      if (foundProfile) {
        // UPDATE
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then((updatedProfile) => res.json(updatedProfile));
      } else {
        //   CREATE NEW

        // to check if handle already exists
        Profile.findOne({ handle: req.body.handle }).then((foundProfile) => {
          if (foundProfile) {
            errors.handle = "handle already exist";
            res.status(400).json(errors);
          }

          // save profile
          new Profile(profileFields)
            .save()
            .then((savedProfile) => res.json(savedProfile));
        });
      }
    });
  }
);

// ADD EXPERIENCE ROUTE
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // VALIDATE
    const { errors, isValid } = validateExperienceInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then((profile) => {
      if (!profile) {
      }

      const addExperienceFields = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };

      // adding new experience input from front in experience field
      profile.experience.unsift(addExperienceFields);

      profile.save().then((profile) => res.json(profile));
    });
  }
);

// ADD EDUCATION
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // VALIDATE
    const { errors, isValid } = validateEducationInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then((profile) => {
      if (!profile) {
      }
      const addEducationFields = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };

      // adding new education input from front in education field
      profile.education.unsift(addEducationFields);

      profile.save().then((savedProfile) => res.json(savedProfile));
    });
  }
);

// ADD DELETE EXPERIENCE ROUTE WITH ITS ID
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      // get remove index
      const getRemoveIndex = profile.experience
        .map((item) => item.id)
        .indexOf(req.params.exp_id);

      // splice/remove out from an array
      profile.experience.splice(getRemoveIndex, 1);

      // save
      profile.save().then((newProfile) => res.json(newProfile));
    });
  }
);

// ADD DELETE EDUCATION ROUTE WITH ITS ID
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      // get remove index
      const getRemoveIndex = profile.education
        .map((item) => item.id)
        .indexOf(req.params.edu_id);

      // splice/remove out from an array
      profile.education.splice(getRemoveIndex, 1);

      // save
      profile.save().then((newProfile) => res.json(newProfile));
    });
  }
);

// DELETE PROFILE WITH USER AT ONE GO
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id })
        .then(() => {
          res.json({ deleted: true });
        })
        .catch((e) => {
          res.status(400).json(e);
        });
    });
  }
);

module.exports = router;
