const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const { post } = require("../routes/feed");

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  console.log(postId);
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const err = new Error("Not able to find the post");
        err.statusCode = 404;
        throw err;
      }
     
      res.status(200).json({ message: "post fetched", post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPosts = (req, res, next) => {
  Post.find()
    .then((posts) => {
      res.status(200).json({ message: "Posts fetched", posts: posts });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  let creator;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const error = new Error("Please enter the valid data");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("File not found error");
    error.status(422);
    throw error;
  }
  const filePath = req.file.path;

  // Create post in db
  const postData = new Post({
    title: title,
    content: content,
    creator: req.userId,
    imageUrl: filePath,
  });
  postData
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.posts.push(postData);
      return user.save();
    })
    .then((result) => {
      console.log(result);
      console.log(postData);

      res.status(201).json({
        message: "Post created successfully!",
        post: postData,
        creator: { _id: creator.id, name: creator.name },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const error = new Error("Please enter the valid data");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error("There is no image.");
    error.statusCode = 422;
    throw error;
  }
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Not able to find the post");
        error.status(500);
        throw error;
      }
      if(post.creator.toString()!==req.userId){
        const error= new Error('Authentication issue');
        error.statusCode('403');
        throw error;
      }
      if (imageUrl != post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Updated success fully", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};
exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  console.log("In delete post controller " + postId);
  Post.findById(postId)
    .then((post) => {
      console.log(post);
      if (!post) {
        const err = new Error("Not able to find the post with this id");
        err.statusCode = 404;
        throw err;
      }
      if(post.creator.toString()!==req.userId){
        const error= new Error('Authentication issue');
        error.statusCode('403');
        throw error;
      }

      clearImage(post.imageUrl);
      console.log("After clear image");
      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
    const user= User.findById(req.userId);
      user.posts.poll(postId);
      return  user.save();}).then(user=>{
      console.log(result);
      res.status(200).json({ message: "Post deleted successfully" });
    })
    .catch((err) => {
      if (err.statusCode) {
        err.statusCode = 500;
        next(err);
      }
    });
};
