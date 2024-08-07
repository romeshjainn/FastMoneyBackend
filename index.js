import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./src/routes/user/userRoutes.js";

dotenv.config();

const app = express();
const port = 2024;

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running. Firebase connection established.");
});

// Routes
app.use("/api/user", userRoutes); // Mount user routes under /api/users

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
