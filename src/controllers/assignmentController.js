const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");

// @desc    Create new assignment (Draft)
// @route   POST /api/assignments
// @access  Private (Teacher only)
const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    // Validation
    if (!title || !description || !dueDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create assignment (status defaults to 'draft')
    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      createdBy: req.user._id, // From JWT middleware
    });

    res.status(201).json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all assignments for logged-in teacher
// @route   GET /api/assignments
// @access  Private (Teacher only)
const getTeacherAssignments = async (req, res) => {
  try {
    const { status } = req.query; // Filter by status if provided

    const filter = { createdBy: req.user._id };
    
    // Optional filter by status
    if (status) {
      filter.status = status;
    }

    const assignments = await Assignment.find(filter).sort({ createdAt: -1 });

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

// @desc    Update assignment status (Publish or Complete)
// @route   PUT /api/assignments/:id
// @access  Private (Teacher only)
const updateAssignment = async (req, res) => {
  try {
    const { status } = req.body;

    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check ownership
    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this assignment" });
    }

    // Workflow rules
    if (assignment.status === "completed") {
      return res.status(400).json({ message: "Cannot modify completed assignments" });
    }

    // Update status
    assignment.status = status || assignment.status;
    await assignment.save();

    res.status(200).json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete assignment (only draft)
// @route   DELETE /api/assignments/:id
// @access  Private (Teacher only)
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check ownership
    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this assignment" });
    }

    // Can only delete draft
    if (assignment.status !== "draft") {
      return res.status(400).json({ message: "Can only delete draft assignments" });
    }

    await assignment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Assignment deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private (Teacher only)
const getAssignmentSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check ownership
    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const submissions = await Submission.find({ assignment: req.params.id })
      .populate("student", "name email")
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

module.exports = {
  createAssignment,
  getTeacherAssignments,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
};
