const express = require("express");
const {
  createAssignment,
  getTeacherAssignments,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
} = require("../controllers/assignmentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication (protect middleware)
router.post("/", protect, createAssignment);
router.get("/", protect, getTeacherAssignments);
router.put("/:id", protect, updateAssignment);
router.delete("/:id", protect, deleteAssignment);
router.get("/:id/submissions", protect, getAssignmentSubmissions);

module.exports = router;
