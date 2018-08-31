const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const keys = require('./config/keys');
require('./models/Users');
require('./models/Survey');
require('./services/passport');

const PORT = process.env.PORT || 5000;

mongoose.connect(keys.mongoURI).then(
	() => {
		console.log('Connected to database');
	},
	err => {
		console.log(err);
	}
);

const app = express();

app.use(bodyParser.json());

// Extreact cookie data
app.use(
	cookieSession({
		maxAge: 30 * 24 * 60 * 60 * 1000,
		keys: [keys.cookieKey]
	})
);

// in order to use cookie sessions we need to start it
app.use(passport.initialize());
// creates persistent login sessions
app.use(passport.session());

/////////////// ROUTES ////////////////
require('./routes/auth-routes')(app);
require('./routes/billingRoutes')(app);
require('./routes/surveyRoutes')(app);

if (process.env.NODE_ENV === 'production') {
	// Express will server production assets
	// LIke our main.js or main.css files
	app.use(express.static('client/build'));
	// Express will serve the index.html file if the route is not recognized

	const path = require('path');
	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
}

app.listen(PORT, () => {
	console.log(`Listening on ${PORT}`);
});
