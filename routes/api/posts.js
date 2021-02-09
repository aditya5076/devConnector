const express = require("express");
const passport = require("passport");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const keys = require("../../configs/key");
const router = express.Router();

const validatePostInput = require("../../validation/post");

router.get("/test", (req, res) => res.json({ msg: "posts works" }));

// GET ALL POST
router.get("/", (req, res) => {
  const errors = {};
  Post.find()
    .sort({ date: -1 })
    .populate("user", ["name", "email"])
    .then((foundPosts) => {
      if (!foundPosts) {
        errors.Posts = "there's no profiles";
        return res.status(404).json(errors);
      }
      res.json(foundPosts);
    })
    .catch((e) => res.status(400).json(errors));
});

// SINGLE POST BY ID
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findOne({ _id: req.params.id })
      //   .populate("users", ["name", "avatar"])
      .then((post) => {
        if (!post) {
          return res.status(404).json({ error: "post not found" });
        }
        res.json(post);
      });
  }
);

// CREATING POSTS
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      user: req.user.id,
      avatar: req.body.avatar,
    });

    newPost
      .save()
      .then((createdPost) => res.json(createdPost))
      .catch((e) => res.status(401).json(e));
  }
);

// DELETE POST
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      const errors = {};
      Post.findById(req.params.id).then((foundedPost) => {
        // to check post owner
        if (foundedPost.user.toString() !== req.user.id) {
          errors.delete = "you are not authorized";
          return res.status(401).json(errors);
        }
        // delete
        foundedPost
          .remove()
          .then(() => res.json({ success: true }))
          .catch((e) => res.status.json(e));
      });
    });
  }
);

// ADD LIKE
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      const errors = {};
      Post.findById(req.params.id).then((foundedPost) => {
        //   check if user have liked the post
        if (
          foundedPost.likes.filter(
            (like) => like.user.toString() === res.user.id
          ).length > 0
        ) {
          errors.like = "you have already liked the post";
          return res.status(400).json(errors);
        }
        // add user into likes array
        foundedPost.likes.unshift({ user: req.user.id });
        foundedPost
          .save()
          .then((post) => res.json(post))
          .catch((e) => res.status(400).json(e));
      });
    });
  }
);

// UNLIKE
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      Post.findById(req.params.id)
        .then((post) => {
          if (
            post.likes.filter((like) => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: "You have not yet liked this post" });
          }

          // Get remove index
          const removeIndex = post.likes
            .map((item) => item.user.toString())
            .indexOf(req.user.id);

          // Splice out of array
          post.likes.splice(removeIndex, 1);

          // Save
          post.save().then((post) => res.json(post));
        })
        .catch((err) =>
          res.status(404).json({ postnotfound: "No post found" })
        );
    });
  }
);

// ADD COMMENT
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    Post.findById(req.params.id).then((post) => {
      if (!post) {
      }
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id,
      };

      // add to comments array
      post.comments.unshift(newComment);

      // save comments to post
      post
        .save()
        .then((post) => res.json(post))
        .catch((e) => res.status(400).json(e));
    });
  }
);

// REMOVE COMMENT
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      Post.findById(req.params.id).then((post) => {
        if (
          post.comments.filter(
            (item) => item._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          res.status(404).json({ nocomment: "no comment found" });
        }

        // get removeIndex
        const removeIndex = post.comments
          .map((item) => item._id.toString())
          .indexOf(req.params.comment_id);

        // remove that index from comment array
        post.comments.splice(removeIndex, 1);

        // save
        post
          .save()
          .then(() => res.json({ success: true }))
          .catch((e) => res.status(400).json(e));
      });
    });
  }
);

module.exports = router;
