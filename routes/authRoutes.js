const express = require("express");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const authenticate = require("../middlewares/authenticate");
const bcrypt = require("bcryptjs");

module.exports = app => {
  app.post("/api/register", (req, res) => {
    if (req.body.password !== req.body.passwordConf) {
      res.status(403).send({
        errorMessage: "Password and Password Confirmation Do Not Match"
      });
    }
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
      })
      .catch(err => {
        res.status(400).send(err);
      });
  });

  app.get("/api/me", authenticate, (req, res) => {
    res.send(req.user);
  });

  app.post("/api/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findByCredentials(email, password)
      .then(user => {
        return user.generateAuthToken().then(token => {
          res.header("x-auth", token).send(user);
        });
      })
      .catch(err => {
        res.status(403).send({
          errorMessage: "Invalid Login"
        });
      });
  });

  app.delete("/api/me/token", authenticate, (req, res) => {
    req.user.removeToken(req.token).then(
      () => {
        res.status(200).send();
      },
      () => {
        res.status(400).send();
      }
    );
  });
};
