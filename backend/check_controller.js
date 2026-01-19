const controller = require("./src/controllers/userController");
console.log("Keys:", Object.keys(controller));
console.log("getUserPosts type:", typeof controller.getUserPosts);
console.log(
  "getUserContributions type:",
  typeof controller.getUserContributions
);
