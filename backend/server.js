const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });

// Routes
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/locations", require("./src/routes/locations"));
app.use("/api/cities", require("./src/routes/cities"));
app.use("/api/categories", require("./src/routes/categories"));
app.use("/api/reviews", require("./src/routes/reviews"));
app.use("/api/uploads", require("./src/routes/uploads"));
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/contributions", require("./src/routes/contributions"));
app.use("/api/notifications", require("./src/routes/notifications"));

// Admin Routes
app.use("/api/admin/users", require("./src/routes/adminUsers"));
app.use("/api/admin/locations", require("./src/routes/adminLocations"));
app.use("/api/admin/cities", require("./src/routes/adminCities"));
app.use("/api/admin/categories", require("./src/routes/adminCategories"));
app.use("/api/admin/posts", require("./src/routes/adminPosts"));
app.use("/api/admin/reports", require("./src/routes/adminReports"));
app.use("/api/admin/uploads", require("./src/routes/adminUploads"));
app.use("/api/admin/reviews", require("./src/routes/adminReviews"));
app.use("/api/admin/notifications", require("./src/routes/adminNotifications"));
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend is running and connected to DB",
    timestamp: new Date().toISOString(),
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
