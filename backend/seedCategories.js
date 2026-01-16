const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./src/models/Category");

dotenv.config();

const categories = [
  {
    name: "Khách sạn",
    icon: "hotel",
    description: "Nơi lưu trú, nghỉ dưỡng",
    status: "active",
  },
  {
    name: "Ẩm thực",
    icon: "utensils",
    description: "Nhà hàng, quán ăn, đặc sản",
    status: "active",
  },
  {
    name: "Tham quan",
    icon: "map",
    description: "Địa điểm du lịch, tham quan",
    status: "active",
  },
  {
    name: "Kỳ quan",
    icon: "camera",
    description: "Danh lam thắng cảnh, kỳ quan thiên nhiên",
    status: "active",
  },
  {
    name: "Giải trí",
    icon: "coffee",
    description: "Khu vui chơi, giải trí, cafe",
    status: "active",
  },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const count = await Category.countDocuments();
    if (count > 0) {
      console.log("Categories already exist. Skipping...", count);
      // Optional: Force update or clear if needed, but for now just skip
      // await Category.deleteMany({});
    } else {
      await Category.insertMany(categories);
      console.log("Categories seeded successfully");
    }

    process.exit();
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
};

seedCategories();
