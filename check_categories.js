const axios = require("axios");

async function fetchCategories() {
  try {
    const res = await axios.get("http://localhost:5000/api/categories");
    console.log("Categories:", JSON.stringify(res.data, null, 2));

    if (res.data.items) {
      console.log("\n=== Category Names ===");
      res.data.items.forEach((cat) => {
        console.log(`- "${cat.name}"`);
      });
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

fetchCategories();
