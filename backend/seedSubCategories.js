const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./src/models/Category");

dotenv.config();

const subCategoriesMap = {
  "Ẩm thực": ["Nhà hàng", "Quán nhậu", "Hải sản tươi sống", "Món Huế"],
  "Khách sạn": ["Resort", "Homestay", "Khách sạn 5 sao", "Nhà nghỉ"],
  "Tham quan": ["Di tích lịch sử", "Bảo tàng", "Công viên"],
  "Giải trí": ["Bar/Pub", "Cafe", "Rạp chiếu phim"],
  "Kỳ quan": ["Hang động", "Vịnh", "Đảo"],
};

const seedSubCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    for (const [parentName, subs] of Object.entries(subCategoriesMap)) {
      const parent = await Category.findOne({ name: parentName, parent: null });
      if (!parent) {
        console.log(`Parent category '${parentName}' not found. Skipping...`);
        continue;
      }

      console.log(`Found parent: ${parentName} (${parent._id})`);

      for (const subName of subs) {
        const exists = await Category.findOne({ name: subName });
        if (!exists) {
          await Category.create({
            name: subName,
            parent: parent._id,
            status: "active",
            description: `Danh mục con của ${parentName}`,
          });
          console.log(`  + Created sub-category: ${subName}`);
        } else {
          console.log(`  - Sub-category '${subName}' already exists.`);
        }
      }
    }

    console.log("Seeding completed.");
    process.exit();
  } catch (error) {
    console.error("Error seeding sub-categories:", error);
    process.exit(1);
  }
};

seedSubCategories();
