const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const bcrypt = require("bcrypt");
const User = require("../schema/User");
require("dotenv").config(); // Ensure this is at the top
const FacebookStrategy = require("passport-facebook").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;

const google_clientId = process.env.GOOGLE_CLIENT_ID;
const google_clientSecret = process.env.GOOGLE_CLIENT_SECRET;

const linkedin_clientId = process.env.LINKEDIN_CLIENT_ID;
const linkedin_clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

const facebook_clientId = process.env.FACEBOOK_APP_ID;
const facebook_clientSecret = process.env.FACEBOOK_APP_SECRET;

const twitter_clientId = process.env.TWITTER_API;
const twitter_clientSecret = process.env.TWIITER_SECRET;

// Check if environment variables are loaded
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error("Google Client ID or Secret not set in .env file");
  process.exit(1);
}

// Local Strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: google_clientId,
      clientSecret: google_clientSecret,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = new User({
            googleId: profile.id,
            username: profile.displayName,
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new LinkedInStrategy(
    {
      clientID: linkedin_clientId,
      clientSecret: linkedin_clientSecret,
      callbackURL: "http://localhost:3000/auth/linkedin/callback",
      scope: ["r_emailaddress", "r_liteprofile"], // Requesting email and basic profile info
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("profile", profile);
      try {
        let user = await User.findOne({ linkedinId: profile.id });

        if (!user) {
          user = new User({
            linkedinId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value, // You can extract the email if needed
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: facebook_clientId,
      clientSecret: facebook_clientSecret,
      callbackURL: "http://localhost:3000/auth/facebook/callback",
      profileFields: ["id", "displayName", "email"], // Fields to request from Facebook
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ facebookId: profile.id });

        if (!user) {
          user = new User({
            facebookId: profile.id,
            username: profile.displayName,
            email: profile.emails ? profile.emails[0].value : "", // Check if email exists
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new TwitterStrategy(
    {
      consumerKey: twitter_clientId,
      consumerSecret: twitter_clientSecret,
      callbackURL: "http://localhost:3000/auth/twitter/callback",
      includeEmail: true, // Request email from Twitter
    },
    async (token, tokenSecret, profile, done) => {
      try {
        let user = await User.findOne({ twitterId: profile.id });

        if (!user) {
          user = new User({
            twitterId: profile.id,
            username: profile.displayName,
            email: profile.emails ? profile.emails[0].value : "", // Check if email exists
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
