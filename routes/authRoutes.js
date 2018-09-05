const express = require("express");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const authenticate = require("../middlewares/authenticate");

module.exports = app => {
  // Registers a new user
  app.post("/api/new-user", (req, res) => {
    const user = new User({
      email: req.body.email,
      password: req.body.password
    });
    //  user is saved in the database
    user
      .save()
      // We create a token for that user
      .then(() => {
        return user.generateAuthToken();
      })
      // We send back that user and redirect them
      .then(token => {
        res.header("x-auth", token).send(user);
        res.redirect("/surveys");
      })
      .catch(err => {
        res.status(400).send(err);
      });
  });

  app.get("/api/me", authenticate, (req, res) => {
    res.send(req.user);
  });
};
