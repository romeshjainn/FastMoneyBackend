const express = require("express");
const router = express.Router();
const {
  getCollection,
  sendVerificationMail,
  getUserData,
  verifyOTP,
} = require("../controller/userController");

router.post("/send-otp", sendVerificationMail);
router.post("/verify-otp", verifyOTP);
router.post("/get-users", getUserData);
router.get("/collection", getCollection);
router.get("/mail", sendVerificationMail);

module.exports = router;
