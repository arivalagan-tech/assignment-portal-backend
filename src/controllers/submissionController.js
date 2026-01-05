const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");

// @desc    Submit answer to assignment
// @route   POST /api/submissions
// @access  Private (Student only)
const submitAnswer = async (req, res) => {
  try {
    const { assignmentId, answer } = req.body;

    // Validation
    if (!assignmentId || !answer) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if assignment exists and is published
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (assignment.status !== "published") {
      return res.status(400).json({ message: "Assignment is not available for submission" });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id,
    });

    if (existingSubmission) {
      return res.status(400).json({ message: "You have already submitted this assignment" });
    }

    // Create submission
    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user._id,
      answer,
    });

    const populatedSubmission = await Submission.findById(submission._id)
      .populate("assignment", "title description")
      .populate("student", "name email");

    res.status(201).json({
      success: true,
      submission: populatedSubmission,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get student's own submissions
// @route   GET /api/submissions/my-submissions
// @access  Private (Student only)
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate("assignment", "title description dueDate status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all published assignments (for students to view)
// @route   GET /api/submissions/assignments
// @access  Private (Student only)
const getPublishedAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ status: "published" })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  submitAnswer,
  getMySubmissions,
  getPublishedAssignments,
};
