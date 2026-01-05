const express = require("express");
const {
  submitAnswer,
  getMySubmissions,
  getPublishedAssignments,
} = require("../controllers/submissionController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.post("/", protect, submitAnswer);
router.get("/my-submissions", protect, getMySubmissions);
router.get("/assignments", protect, getPublishedAssignments);

module.exports = router;
