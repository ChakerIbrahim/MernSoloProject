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
    // Check whether an account with this email already exists before
    // creating a new one. Without this, two accounts could end up sharing
    // the same email — and since login looks users up by email, one of
    // them would become permanently unreachable, silently
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

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

// Handles GET /api/me — protected by verifyToken. If we got this far,
// req.user already has { email, id } decoded from a valid cookie
const getCurrentUser = async (req, res) => {
  try {
      const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Handles POST /api/logout — clears the cookie so the browser stops
// sending it, effectively ending the session
const logoutUser = (req, res) => {
  res.clearCookie("jwt");
  return res.json({ message: "Logged out" });
};

// Export all three functions together as one object, matching his pattern —
// this is what user.routes.js will import and attach to actual URLs
module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getCurrentUser,
  logoutUser,
};