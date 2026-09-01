// Import the User model — this is how we create, find, and update users in MongoDB
const User = require("../models/user.model");

// bcrypt lets us compare a plain-text password against the hashed one in the database
const bcrypt = require("bcrypt");

// jsonwebtoken creates and verifies the login tokens
const jwt = require("jsonwebtoken");

// Load environment variables so we can read process.env.SECRET
require("dotenv").config();

// Handles POST /api/register — creates a new traveler or agency account
const registerUser = async (req, res) => {
  try {
    // req.body contains whatever the frontend sent: firstName, email, password,
    // confirmPassword, role, and (if an agency) agencyName etc.
    // User.create() runs the schema's pre("validate") and pre("save") hooks
    // automatically — that's where password matching + hashing happen
    const user = await User.create(req.body);

    // Create a signed token containing just enough info to identify this user later
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.SECRET,
    );

    // Send the token back as an httpOnly cookie (JavaScript in the browser can't
    // read it, which protects against certain attacks), along with the new user
    return res.cookie("jwt", token, { httpOnly: true }).json({ user });
  } catch (error) {
    // If validation fails (e.g. passwords didn't match, email missing), this catches it
    return res.status(400).json({ message: error.message });
  }
};

// Handles POST /api/login — checks credentials and issues a token if they're valid
const loginUser = async (req, res) => {
  try {
    // Look up the user by the email they typed
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ message: "Email does not exist" });
    }

      // bcrypt.compare returns a Promise, so this must be awaited — otherwise
    // isValid would be the Promise object itself, which is always truthy,
    // and would let anyone log in regardless of the password entered
    const isValid = await bcrypt.compare(req.body.password, user.password);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.SECRET,
    );

    return res.cookie("jwt", token, { httpOnly: true }).json({ user });
  } catch (err) {
        return res.status(400).json({ error: err.message });
  }
};

// Handles GET /api/users — mainly useful for us to verify data during development
const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    return res.json({ users });
  } catch (err) {
    return res.status(404).json({ message: "Error fetching users" });
  }
};

// Export all three functions together as one object, matching his pattern —
// this is what user.routes.js will import and attach to actual URLs
module.exports = {
  registerUser,
  loginUser,
  getUsers,
};