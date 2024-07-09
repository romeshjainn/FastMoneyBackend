// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const userRoutes = require("./src/routes/userRoutes");
// // Load environment variables from .env
// dotenv.config();

// const app = express();
// const port = process.env.PORT || 2024;

// // Middleware
// app.use(cors());
// app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("Server is running. Firebase connection established.");
// });

// // Routes
// app.use("/api", userRoutes); // Mount user routes under /api/users

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./src/routes/user/userRoutes");
const http = require("http");
const WebSocket = require("ws");

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

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on("connection", (ws) => {
  console.log("Client connected");
  clients.push(ws);

  ws.on("message", (message) => {
    console.log("Received:", message);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clients = clients.filter((client) => client !== ws);
  });
});

const broadcastMessage = (message) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ data: message }), (error) => {
        if (error) {
          console.error("Error sending message:", error.message);
        } else {
          console.log("Array sent successfully:", message);
        }
      });
    }
  });
};

// Example: Send an array to the frontend after 3 seconds
setTimeout(() => {
  const dataArray = ["item1", "item2", "item3"];
  broadcastMessage(dataArray);
}, 3000); // Increased delay to ensure clients are properly connected

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
