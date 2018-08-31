const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('users')

// pulls user id out of cookie data
passport.serializeUser((user, done) => {
	done(null, user.id)
})

// Turns user id into a user
passport.deserializeUser((id, done) => {
	User.findById(id)
		.then((user) => {
			done(null, user)
		})
})

// creates a new user if not already in database
passport.use(new GoogleStrategy({
	clientID: keys.googleClientID,
	clientSecret: keys.googleClientSecret,
	callbackURL: '/auth/google/callback',
	proxy: true
}, async (accessToken, refreshToken, profile, done) => {
	const existingUser = await User.findOne({
		googleId: profile.id
	})

	if (existingUser) {
		// We already have a record with the given profile ID
	return 	done(null, existingUser)
	}
	// We dont have a record with this IF, , make a new user
	const user = await new User({
			googleId: profile.id
		}).save()
	done(null, user)
}))
