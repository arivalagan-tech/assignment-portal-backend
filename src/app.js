const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));               // Login
app.use('/api/assignments', require('./routes/assignmentRoutes'));  // assignments
app.use('/api/submissions', require('./routes/submissionRoutes'));  // submissions



// Test route
app.get("/", (req, res) => {
  res.send("Assignment Portal Backend API is running");
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
