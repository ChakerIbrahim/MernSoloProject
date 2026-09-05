require("dotenv").config();

const mongoose = require("mongoose");

require("./config/mongoose.config");

const User = require("./models/user.model");
const Package = require("./models/package.model");
// NEW: needed so we can clear these out too on every reseed
const Inquiry = require("./models/inquiry.model");
const Message = require("./models/message.model");

const seedDatabase = async () => {
  try {
    // Clear everything so running this script twice never leaves stale,
    // orphaned data behind — Inquiries/Messages reference User and Package
    // IDs, which change every time this script runs, so old inquiries would
    // otherwise point at documents that no longer exist
    await User.deleteMany({});
    await Package.deleteMany({});
    await Inquiry.deleteMany({});
    await Message.deleteMany({});

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

    await User.create({
      firstName: "Sara",
      email: "sara@traveler.com",
      password: "password123",
      confirmPassword: "password123",
      role: "traveler",
    });

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
        agency: agencies[0]._id,
        title: "Santorini Escape",
        destination: "Greece",
        price: 1350,
        durationDays: 6,
        includes: ["Flights", "Hotel", "Sunset cruise", "Breakfast"],
        description: "Whitewashed cliffs, blue domes, and caldera views.",
        spotsAvailable: 7,
        tags: ["beach", "honeymoon", "romantic", "luxury"],
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
        agency: agencies[1]._id,
        title: "Machu Picchu Trek",
        destination: "Peru",
        price: 1100,
        durationDays: 8,
        includes: ["Guide", "Permits", "Camping gear", "Some meals"],
        description: "A multi-day trek through the Andes to Machu Picchu.",
        spotsAvailable: 6,
        tags: ["adventure", "hiking"],
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
      {
        agency: agencies[2]._id,
        title: "Istanbul & Cappadocia",
        destination: "Turkey",
        price: 710,
        durationDays: 6,
        includes: ["Flights", "Hotel", "Hot air balloon ride", "Breakfast"],
        description: "Grand bazaars, mosques, and sunrise over Cappadocia.",
        spotsAvailable: 11,
        tags: ["culture", "city", "budget"],
      },
    ]);

    console.log("Database seeded successfully");
  } catch (error) {
    console.log("Error seeding database:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();