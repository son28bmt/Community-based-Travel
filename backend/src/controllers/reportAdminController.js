const Report = require("../models/Report");

const listReports = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const search = (req.query.search || "").trim();
    const status = (req.query.status || "").trim();
    const severity = (req.query.severity || "").trim();
    const type = (req.query.type || "").trim();

    const filter = {};
    if (search) {
      filter.$or = [
        { targetName: { $regex: search, $options: "i" } },
        { reason: { $regex: search, $options: "i" } },
        { reporterName: { $regex: search, $options: "i" } },
        { reporterEmail: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      filter.status = status;
    }
    if (severity) {
      filter.severity = severity;
    }
    if (type) {
      filter.targetType = type;
    }

    const [items, total] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("reporter", "name email")
        .populate("resolvedBy", "name email"),
      Report.countDocuments(filter),
    ]);

    return res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return next(err);
  }
};

const getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("reporter", "name email")
      .populate("resolvedBy", "name email");
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    return res.json({ report });
  } catch (err) {
    return next(err);
  }
};

const createReport = async (req, res, next) => {
  try {
    const {
      targetType,
      targetId,
      targetName,
      reason,
      severity,
      reporterName,
      reporterEmail,
    } = req.body;
    const report = await Report.create({
      targetType,
      targetId,
      targetName,
      reason,
      severity,
      reporter: req.user?.id,
      reporterName,
      reporterEmail,
    });
    return res.status(201).json({ report });
  } catch (err) {
    return next(err);
  }
};

const updateReport = async (req, res, next) => {
  try {
    const { status, severity, action } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (status !== undefined) {
      report.status = status;
      if (status === "resolved") {
        report.resolvedAt = new Date();
        report.resolvedBy = req.user?.id;
      }
      if (status !== "resolved") {
        report.resolvedAt = null;
        report.resolvedBy = null;
      }
    }
    if (severity !== undefined) report.severity = severity;
    if (action !== undefined) report.action = action;

    await report.save();
    return res.json({ report });
  } catch (err) {
    return next(err);
  }
};

const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    await report.deleteOne();
    return res.json({ message: "Report deleted" });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
};
