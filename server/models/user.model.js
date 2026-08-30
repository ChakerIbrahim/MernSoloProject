// Import mongoose so we can define a schema and create a model from it
const mongoose = require("mongoose");

// bcrypt lets us hash the password before saving it, so we never store plain text passwords
const bcrypt = require("bcrypt");

// Define the shape of a User document in MongoDB
const UserSchema = new mongoose.Schema(
  {
    // Every user (traveler or agency) has a first name
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },

    // Email is used to log in and must be provided
    email: {
      type: String,
      required: [true, "Email is required"],
    },

    // Password is hashed before saving — see the pre("save") hook below
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },

    // This is what makes the marketplace two-sided: every account is either
    // a traveler looking for packages, or an agency selling them
    role: {
      type: String,
      enum: ["traveler", "agency"],
      required: [true, "Role is required"],
    },

    // The next three fields only apply when role is "agency" — a traveler
    // account just leaves these blank
    agencyName: {
      type: String,
    },

    agencyDescription: {
      type: String,
    },

    agencyLogo: {
      type: String,
    },
  },
  // timestamps: true automatically adds createdAt and updatedAt fields to every user
  { timestamps: true },
);

// A "virtual" field called confirmPassword — it's never actually saved to the
// database, it only exists temporarily so we can check the user typed their
// password correctly twice during registration
UserSchema.virtual("confirmPassword").set(function (value) {
  this._confirmPassword = value;
});

// Before Mongoose validates the document, check that password and confirmPassword match
UserSchema.pre("validate", function () {
  // isModified("password") is true when creating a new user, or when a
  // password is being changed — this hook shouldn't run every other time
  if (!this.isModified("password")) return;

  if (this.password !== this._confirmPassword) {
    this.invalidate("confirmPassword", "Passwords must match");
  }
});

// Right before saving, replace the plain-text password with a hashed version.
// This runs AFTER the check above, so by this point we already know the two
// passwords the user typed matched each other
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// Turn the schema into an actual Model we can use to create/find/update users
const User = mongoose.model("User", UserSchema);

module.exports = User;