const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./src/routes/userRoutes");
// Load environment variables from .env
dotenv.config();

const app = express();
const port = process.env.PORT || 2024;

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running. Firebase connection established.");
});

// Routes
app.use("/api", userRoutes); // Mount user routes under /api/users

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
