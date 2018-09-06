const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not a valid email"
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ],
  credits: {
    type: Number,
    default: 0
  }
});

// Instance Method
UserSchema.methods.generateAuthToken = function() {
  var user = this;
  var access = "auth";
  var token = jwt
    .sign(
      {
        _id: user._id.toHexString(),
        access
      },
      "abc123"
    )
    .toString();

  user.tokens.push({
    access,
    token
  });

  return user.save().then(() => {
    return token;
  });
};

// Model Method
UserSchema.statics.findByToken = function(token) {
  const User = this;
  let decoded;

  try {
    // Verify that the token is something we created
    decoded = jwt.verify(token, "abc123");
  } catch (e) {
    return new Promise((resolve, reject) => {
      reject();
    });
  }

  return User.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"
  });
};

UserSchema.pre("save", function(next) {
  const user = this;
  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

mongoose.model("User", UserSchema);
