const mongoose = require('mongoose');
const {
  Schema
} = mongoose
const RecipientSchema = require('./Recipient');

const surveySchema = new Schema({
  title: String,
  body: String,
  subject: String,
  // This tells mongoose that the recipients will be a subdocument with a
  // with an array of recipients
  recipients: [RecipientSchema],
  // Answered
  yes: {
    type: Number,
    default: 0
  },
  no: {
    type: Number,
    default: 0
  },
  // Sets up a relation between the survey and the user who created it
  _user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  dateSent: Date,
  lastResponded: Date
})

mongoose.model('surveys', surveySchema)