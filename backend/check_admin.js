const mongoose = require("mongoose");
const User = require("./src/models/User");
const dotenv = require("dotenv");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to DB");
    const user = await User.findOne({ username: "admin" });
    if (user) {
      console.log("Found user:", user);
    } else {
      console.log("User 'admin' NOT FOUND");
      const allUsers = await User.find({}).limit(5);
      console.log(
        "First 5 users:",
        allUsers.map((u) => ({
          id: u._id,
          username: u.username,
          email: u.email,
        }))
      );
    }
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
