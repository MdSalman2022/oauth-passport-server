const User = require("../schema/User");
const passport = require("passport");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();
exports.signup = async (req, res) => {
  console.log("hittt");
  const { username, password } = req.body; // Extract username and password from request body
  try {
    // Generate a salt for hashing the password
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the generated salt
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create a new user with the hashed password
    const user = new User({ username, password: hashedPassword });
    // Save the user to the database
    await user.save();
    // Send a success response
    res.status(201).send({
      success: true,
    });
  } catch (err) {
    // Send an error response if something goes wrong
    res.status(400).send(err.message);
  }
};

// Login function to handle user authentication
exports.login = (req, res, next) => {
  // Use Passport's local strategy to authenticate the user
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err); // Handle any errors that occur during authentication
    if (!user) return res.status(400).send(info.message); // If user is not found, send an error response
    // Log the user in
    req.logIn(user, (err) => {
      if (err) return next(err); // Handle any errors that occur during login
      // Generate a JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username }, // Include user ID and username in the token

        process.env.JWT_SECRET,
        { expiresIn: "1h" } // Token expiration time
      );
      return res.send({
        success: true,
        token, // Send the token to the frontend
      });
    });
  })(req, res, next); // Call the Passport authenticate function with the request, response, and next middleware
};
