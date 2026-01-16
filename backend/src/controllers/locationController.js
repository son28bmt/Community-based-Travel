const Location = require("../models/Location");
const Category = require("../models/Category");
const City = require("../models/City");

// @desc    Get all public locations (approved) with pagination, search, filter
// @route   GET /api/locations
// @access  Public
const getLocations = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 12, 1);
    let search = (req.query.search || "").trim();
    let category = (req.query.category || "").trim();
    let province = (req.query.province || "").trim();
    const sort = (req.query.sort || "").trim();
    const ratingMin = parseFloat(req.query.ratingMin);
    const ratingMax = parseFloat(req.query.ratingMax);
    const includeRatings = req.query.includeRatings === "1";

    // Helper to remove tones
    function removeVietnameseTones(str) {
      str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
      str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
      str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
      str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
      str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
      str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
      str = str.replace(/đ/g, "d");
      str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
      str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
      str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
      str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
      str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
      str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
      str = str.replace(/Đ/g, "D");
      str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
      return str;
    }

    // Helper to map categories to parent names
    const mapToParentCategory = async (locs) => {
      return Promise.all(
        locs.map(async (loc) => {
          const locObj = loc.toObject ? loc.toObject() : loc;
          // Find the category doc for this location
          const catDoc = await Category.findOne({
            name: locObj.category,
          }).populate("parent");
          if (catDoc && catDoc.parent) {
            locObj.category = catDoc.parent.name;
          }
          return locObj;
        })
      );
    };

    // Smart Search Parsing
    if (search) {
      console.log("Original Search:", search);
      const searchNormalized = removeVietnameseTones(search).toLowerCase();
      console.log("Normalized Search:", searchNormalized);

      // 1. Detect Province if not set
      if (!province) {
        const cities = await City.find({ status: "active" }).select("name");
        for (const city of cities) {
          const cityNormalized = removeVietnameseTones(city.name).toLowerCase();
          if (
            new RegExp(`\\b${cityNormalized}\\b`, "i").test(searchNormalized)
          ) {
            province = city.name;
            break;
          }
        }
      }

      // 2. Detect Category if not set
      if (!category) {
        const categories = await Category.find({ status: "active" }).select(
          "name"
        );
        for (const cat of categories) {
          const catNormalized = removeVietnameseTones(cat.name).toLowerCase();
          if (
            new RegExp(`\\b${catNormalized}\\b`, "i").test(searchNormalized)
          ) {
            category = cat.name;
            break;
          }
        }
      }

      // 3. Strip Province from Search (Always run if province exists)
      if (province) {
        const pName = province;
        const pNameUn = removeVietnameseTones(province);
        // Remove accented (No \b because unicode issues)
        search = search.replace(new RegExp(`${pName}`, "gi"), "");
        // Remove unaccented
        search = search.replace(new RegExp(`${pNameUn}`, "gi"), "");
      }

      // 4. Strip Category from Search (Always run if category exists)
      if (category) {
        const cName = category;
        const cNameUn = removeVietnameseTones(category);
        // Remove accents (No \b)
        search = search.replace(new RegExp(`${cName}`, "gi"), "");
        search = search.replace(new RegExp(`${cNameUn}`, "gi"), "");
      }

      // 5. Clean up connector words
      search = search
        .replace(/\b(tại|ở|trong|khu vực|tai|o|khu vuc)\b/gi, "")
        .trim();
      search = search.replace(/\s+/g, " ").trim();

      console.log(
        "Final Search Parsed:",
        search,
        "Category:",
        category,
        "Province:",
        province
      );
    }

    const query = { status: "approved" };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      const categoryDoc = await Category.findOne({
        name: { $regex: new RegExp(`^${category}$`, "i") },
      });
      if (categoryDoc) {
        const subCategories = await Category.find({
          parent: categoryDoc._id,
        }).select("name");
        const categoryNames = [
          categoryDoc.name,
          ...subCategories.map((c) => c.name),
        ];

        query.category = { $in: categoryNames };
      } else {
        query.category = category;
      }
    }

    if (province) {
      query.province = { $regex: province, $options: "i" };
    }

    const hasRatingFilter =
      !Number.isNaN(ratingMin) || !Number.isNaN(ratingMax);

    if (includeRatings || hasRatingFilter) {
      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "location",
            as: "reviews",
          },
        },
        {
          $addFields: {
            ratingAvg: { $ifNull: [{ $avg: "$reviews.rating" }, 0] },
            ratingCount: { $size: "$reviews" },
          },
        },
      ];

      if (hasRatingFilter) {
        const ratingMatch = {};
        if (!Number.isNaN(ratingMin)) ratingMatch.$gte = ratingMin;
        if (!Number.isNaN(ratingMax)) ratingMatch.$lte = ratingMax;
        pipeline.push({ $match: { ratingAvg: ratingMatch } });
      }

      if (sort === "rating") {
        pipeline.push({ $sort: { ratingAvg: -1, ratingCount: -1 } });
      } else {
        pipeline.push({ $sort: { createdAt: -1 } });
      }

      pipeline.push({
        $facet: {
          items: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            { $project: { reviews: 0, status: 0, user: 0 } },
          ],
          total: [{ $count: "count" }],
        },
      });

      const [result] = await Location.aggregate(pipeline);
      let items = result?.items || [];
      const total = result?.total?.[0]?.count || 0;

      // Map categories
      items = await mapToParentCategory(items);

      return res.status(200).json({
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    let locations = await Location.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-status -user");

    const total = await Location.countDocuments(query);

    // Map categories
    locations = await mapToParentCategory(locations);

    return res.status(200).json({
      items: locations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single location by ID
// @route   GET /api/locations/:id
// @access  Public
const getLocation = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id).populate(
      "createdBy",
      "name"
    );

    if (!location || location.status !== "approved") {
      return res.status(404).json({ message: "Location not found" });
    }

    const reviewAgg = await Location.aggregate([
      { $match: { _id: location._id } },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "location",
          as: "reviews",
        },
      },
      {
        $addFields: {
          rating: { $ifNull: [{ $avg: "$reviews.rating" }, 0] },
          totalReviews: { $size: "$reviews" },
        },
      },
      { $project: { rating: 1, totalReviews: 1 } },
    ]);

    const rating = reviewAgg[0]?.rating || 0;
    const totalReviews = reviewAgg[0]?.totalReviews || 0;

    return res.status(200).json({
      ...location.toObject(),
      rating,
      totalReviews,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLocations,
  getLocation,
};
