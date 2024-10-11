const express = require("express");
const authController = require("../controllers/authController");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();

require("dotenv").config();
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Initiate Google OAuth flow
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Handle Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Generate a token for the session
    const token = jwt.sign(
      { username: req.user.username },
      process.env.JWT_SECRET
    );
    // Send a script to close the popup and pass the token to the main window
    res.send(`
      <script>
        window.opener.postMessage({ token: '${token}' }, '*');
        window.close();
      </script>
    `);
  }
);

// Initiate LinkedIn OAuth flow
router.get("/linkedin", passport.authenticate("linkedin"));

// LinkedIn OAuth callback
router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", { failureRedirect: "/" }),
  (req, res) => {
    // Successful authentication
    const token = jwt.sign(
      { id: req.user.id, username: req.user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send the token back to the frontend
    res.send(`
      <script>
        window.opener.postMessage({ token: '${token}' }, '*');
        window.close();
      </script>
    `);
  }
);

// Initiate Facebook OAuth flow
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

// Facebook OAuth callback
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  (req, res) => {
    // Successful authentication
    const token = jwt.sign(
      { id: req.user.id, username: req.user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send the token back to the frontend
    res.send(`
      <script>
        window.opener.postMessage({ token: '${token}' }, '*');
        window.close();
      </script>
    `);
  }
);

// Data Deletion Callback
router.post("/facebook/data-deletion", async (req, res) => {
  const { signed_request } = req.body;
  const [encodedSig, payload] = signed_request.split(".");
  const sig = Buffer.from(encodedSig, "base64").toString("hex");
  const data = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));

  // Verify the request
  const expectedSig = crypto
    .createHmac("sha256", process.env.FACEBOOK_APP_SECRET)
    .update(payload)
    .digest("hex");

  if (sig !== expectedSig) {
    return res.status(400).send("Invalid request signature");
  }

  // Delete user data
  try {
    await User.findOneAndDelete({ facebookId: data.user_id });
    res.send({
      url: "http://localhost:3000/facebook/data-deletion-status",
      confirmation_code: "your_confirmation_code",
    });
  } catch (error) {
    res.status(500).send("Error deleting user data");
  }
});

router.get("/facebook/data-deletion-status", (req, res) => {
  res.send({ success: true, message: "User data has been deleted." });
});

// Initiate Twitter OAuth flow
router.get("/twitter", passport.authenticate("twitter"));

// Twitter OAuth callback
router.get(
  "/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/" }),
  (req, res) => {
    // Successful authentication
    const token = jwt.sign(
      { id: req.user.id, username: req.user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send the token back to the frontend
    res.send(`
      <script>
        window.opener.postMessage({ token: '${token}' }, '*');
        window.close();
      </script>
    `);
  }
);

// Logout route
router.post("/logout", (req, res) => {
  console.log("Cookies received from frontend:", req.cookies);
  req.logout((err) => {
    if (err) {
      return res.status(500).send("Logout failed");
    }
    res.clearCookie("session"); // Clear the session cookie
    res.send({ success: true, message: "Logged out successfully" });
  });
});

module.exports = router;
