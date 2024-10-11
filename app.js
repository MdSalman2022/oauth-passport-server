const express = require("express");
const mongoose = require("mongoose");
const passport = require("./config/passport");
const session = require("express-session");
const authRoutes = require("./routes/auth");
const cors = require("cors");
const app = express();

require("dotenv").config();

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173", // Replace with your frontend URL
  optionsSuccessStatus: 200,
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions)); // Enable CORS with options

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/oauth-server", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(express.json());
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);

// Start Server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
