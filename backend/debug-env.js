const dotenv = require("dotenv");
dotenv.config();

console.log("Keys loaded:");
Object.keys(process.env).forEach((key) => {
  if (key.includes("MONGO") || key.includes("URI") || key.includes("DB")) {
    console.log(
      `${key}: ${process.env[key] ? process.env[key].substring(0, 10) + "..." : "undefined"}`
    );
  }
});
