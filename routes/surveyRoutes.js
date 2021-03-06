/* eslint-disable */
const _ = require('lodash');
const Path = require('path-parser').default;
const { URL } = require('url');
const mongoose = require('mongoose');
const authenticate = require('../middlewares/authenticate');
const requireCredits = require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');

const Survey = mongoose.model('surveys');

module.exports = (app) => {
  // Fetches all surveys
  app.get('/api/surveys', authenticate, async (req, res) => {
    const surveys = await Survey.find({ _user: req.user.id }).select({
      recipients: false,
    });
    res.send(surveys);
  });

  // Gets a single survey
  app.get('/api/surveys/:surveyid', authenticate, async (req, res) => {
    const surveyId = req.params.surveyid;

    const survey = await Survey.findById({
      _id: surveyId,
    });

    res.send(survey);
  });

  // Creates Survey
  app.post('/api/surveys', authenticate, requireCredits, async (req, res) => {
    const {
      title, subject, body, recipients, id, isDraft,
    } = req.body;
    
    survey = new Survey({
      title,
      subject,
      body,
      recipients: recipients.map(email => ({
        email: email.trim(),
      })),
      _user: req.user.id,
      dateSent: Date.now(),
    });

    if (isDraft) {
      Survey.findByIdAndUpdate(id, { $set: { isDraft: false } }, { new: true, upsert: true })
        .then(() => {
          const mailer = new Mailer(survey, surveyTemplate(survey));
          try {
            mailer.send();
            req.user.credits -= 1;
            const user = req.user.save();
            res.send(user);
          } catch (err) {
            res.status(422).send(err);
          }
        })
    } else {
      const mailer = new Mailer(survey, surveyTemplate(survey));
      try {
        await mailer.send();
        await survey.save();
        req.user.credits -= 1;
        const user = await req.user.save();
        res.send(user);
      } catch (err) {
        res.status(422).send(err);
      }
    }

  });

  // Save survey draft
  app.post('/api/draftsurvey', authenticate, async (req, res) => {
    const {
      title,
      subject,
      body,
      recipients,
    } = req.body;

    const survey = new Survey({
      title,
      subject,
      body,
      recipients: recipients.split(',').map(email => ({
        email: email.trim(),
      })),
      _user: req.user.id,
      dateSent: Date.now(),
      isDraft: true,
    });

    survey.save().then((result) => {
      res.send(result);
    }).catch(() => {
      res.status(400).send({ errorMessage: 'Cannot create draft' });
    });
  });

  // Deletes Survey
  app.delete('/api/surveys/:surveyid', authenticate, async (req, res) => {
    const surveyId = req.params.surveyid;

    Survey.findOneAndDelete(surveyId)
      .then(() => {
        res.status(200).send({ message: 'Survey Successfully Deleted' });
      })
      .catch((err) => {
        res.status(400).send({ errorMessage: err });
      });
  });

  app.get('/api/surveys/:surveyId/:choice', (req, res) => {
    res.statusCode = 302;
    res.setHeader('Location', '/thanks');
    res.end();
  });

  app.post('/api/surveys/webhooks', (req, res) => {
    const p = new Path('/api/surveys/:surveyId/:choice');

    _.chain(req.body)
      .map(({ email, url }) => {
        const match = p.test(new URL(url).pathname);
        if (match) {
          return {
            email,
            surveyId: match.surveyId,
            choice: match.choice,
          };
        }
      })
      .compact()
      .uniqBy('email', 'surveyId')
      .each(({ surveyId, email, choice }) => {
        Survey.updateOne(
          {
            _id: surveyId,
            recipients: {
              $elemMatch: {
                email,
                responded: false,
              },
            },
          },
          {
            $inc: { [choice]: 1 },
            $set: { 'recipients.$.responded': true },
            lasResponded: new Date(),
          },
        ).exec();
      })
      .value();
    res.send({});
  });
};
