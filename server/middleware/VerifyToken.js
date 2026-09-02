// jsonwebtoken lets us verify that a token was really signed by our server
const jwt = require("jsonwebtoken");

// This middleware runs in front of any route that needs to know who's
// making the request. If the cookie is missing or invalid, it stops the
// request here with a 401 (Unauthorized) instead of letting it continue
const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    // Decodes the token and checks it was signed with our SECRET.
    // Throws an error automatically if the token is invalid or expired
    const decoded = jwt.verify(token, process.env.SECRET);

    // Attach the decoded info (email, id) to req, so the actual route
    // handler that runs next can access req.user without redoing this work
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
};

module.exports = verifyToken;