const express = require("express");
const router = express.Router();
const { getCollection } = require("../controller/userController");

// GET request to fetch entire collection
router.get("/collection", getCollection);

module.exports = router;
