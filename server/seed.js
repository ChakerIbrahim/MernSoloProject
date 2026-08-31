// Load .env so this script can read MONGOOSE_URI on its own
require("dotenv").config();

const mongoose = require("mongoose");

// Requiring this runs the connection logic immediately, same as server.js does
require("./config/mongoose.config");

const User = require("./models/user.model");
const Package = require("./models/package.model");

const seedDatabase = async () => {
  try {
    // Clear existing data so running this script twice doesn't create duplicates
    await User.deleteMany({});
    await Package.deleteMany({});

    // Create three agencies. Passing an array to User.create() creates all
    // three at once and returns an array of the created documents, in order —
    // each one still goes through the schema's password hashing hook
    const agencies = await User.create([
      {
        firstName: "Amara",
        email: "amara@sunsettravel.com",
        password: "password123",
        confirmPassword: "password123",
        role: "agency",
        agencyName: "Sunset Travel Co.",
        agencyDescription: "Beach and island getaways across Southeast Asia.",
      },
      {
        firstName: "Karim",
        email: "karim@peaktrails.com",
        password: "password123",
        confirmPassword: "password123",
        role: "agency",
        agencyName: "Peak Trails",
        agencyDescription: "Adventure and hiking trips for small groups.",
      },
      {
        firstName: "Lina",
        email: "lina@citybreakstravel.com",
        password: "password123",
        confirmPassword: "password123",
        role: "agency",
        agencyName: "City Breaks Travel",
        agencyDescription: "Short cultural city trips across Europe.",
      },
    ]);

    // One traveler account too — useful for testing chat/inquiries later
    await User.create({
      firstName: "Sara",
      email: "sara@traveler.com",
      password: "password123",
      confirmPassword: "password123",
      role: "traveler",
    });

    // Now create packages. agencies[0], [1], [2] refer back to the three
    // agencies just created above, in the same order they were listed
    await Package.create([
      {
        agency: agencies[0]._id,
        title: "Bangkok & Phuket Explorer",
        destination: "Thailand",
        price: 950,
        durationDays: 7,
        includes: ["Flights", "Hotel", "Airport transfer", "Breakfast"],
        description: "A mix of city energy and island relaxation.",
        spotsAvailable: 8,
        tags: ["beach", "budget", "culture"],
      },
      {
        agency: agencies[0]._id,
        title: "Bali Retreat",
        destination: "Bali, Indonesia",
        price: 1200,
        durationDays: 6,
        includes: ["Flights", "Villa", "Airport transfer", "Spa day"],
        description: "Quiet villas, rice terraces, and beach sunsets.",
        spotsAvailable: 5,
        tags: ["beach", "relaxation", "honeymoon"],
      },
      {
        agency: agencies[1]._id,
        title: "Atlas Mountains Trek",
        destination: "Morocco",
        price: 780,
        durationDays: 5,
        includes: ["Guide", "Hotel", "Some meals"],
        description: "Guided trekking through Berber villages and peaks.",
        spotsAvailable: 10,
        tags: ["adventure", "hiking", "budget"],
      },
      {
        agency: agencies[1]._id,
        title: "Swiss Alps Hiking Week",
        destination: "Switzerland",
        price: 1850,
        durationDays: 7,
        includes: ["Hotel", "Cable car passes", "Breakfast"],
        description: "Alpine trails with some of the best views in Europe.",
        spotsAvailable: 6,
        tags: ["adventure", "hiking", "luxury"],
      },
      {
        agency: agencies[2]._id,
        title: "Rome Long Weekend",
        destination: "Italy",
        price: 620,
        durationDays: 4,
        includes: ["Flights", "Hotel", "Walking tour"],
        description: "Ancient history and fresh pasta, all in one trip.",
        spotsAvailable: 12,
        tags: ["culture", "city", "budget"],
      },
      {
        agency: agencies[2]._id,
        title: "Paris & Versailles",
        destination: "France",
        price: 890,
        durationDays: 5,
        includes: ["Flights", "Hotel", "Versailles entry", "Breakfast"],
        description: "Classic Paris sights plus a day at Versailles.",
        spotsAvailable: 9,
        tags: ["culture", "city", "romantic"],
      },
    ]);

    console.log("Database seeded successfully");
  } catch (error) {
    console.log("Error seeding database:", error.message);
  } finally {
    // Close the connection so the script actually exits instead of hanging open
    mongoose.connection.close();
  }
};

seedDatabase();