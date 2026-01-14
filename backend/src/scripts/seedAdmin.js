const mongoose = require("mongoose");
const env = require("../config/env");
const User = require("../models/User");

const seedAdmin = async () => {
  await mongoose.connect(env.mongoUri);

  const email = "admin@gmail.com";
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", email);
    await mongoose.disconnect();
    return;
  }

  await User.create({
    name: "Admin",
    email,
    password: "admin123",
    role: "admin",
  });

  console.log("Admin created:", email);
  await mongoose.disconnect();
};

seedAdmin().catch((err) => {
  console.error("Failed to seed admin:", err);
  process.exit(1);
});
