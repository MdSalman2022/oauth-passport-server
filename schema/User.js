const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: false },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  linkedinId: { type: String, unique: true, sparse: true },
  facebookId: { type: String, unique: true, sparse: true },
  twitterId: { type: String, unique: true, sparse: true },
  email: { type: String },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
