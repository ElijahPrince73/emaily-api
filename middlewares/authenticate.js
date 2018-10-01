const mongoose = require('mongoose');

const User = mongoose.model('User');

module.exports = (req, res, next) => {
  const token = req.header('x-auth');

  User.findByToken(token)
    .then((user) => {
      if (!user) {
        return Promise.reject();
      }

      req.user = user;
      req.token = token;
      next();
    })
    .catch((err) => {
      res.status(401).send('Invalid Request');
    });
};
