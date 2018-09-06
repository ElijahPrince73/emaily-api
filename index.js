const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const keys = require("./config/keys");
const cors = require("cors");
require("./models/User");
require("./models/Survey");

const PORT = process.env.PORT || 5000;

mongoose
  .connect(
    keys.mongoURI,
    { useNewUrlParser: true }
  )
  .then(
    () => {
      console.log("Connected to database");
    },
    err => {
      console.log(err);
    }
  );

const app = express();
app.use(cors());
app.use(bodyParser.json());

/////////////// ROUTES ////////////////
require("./routes/authRoutes")(app);
require("./routes/billingRoutes")(app);
require("./routes/surveyRoutes")(app);

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
