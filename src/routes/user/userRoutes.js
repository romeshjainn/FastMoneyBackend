import express from "express";
const userRoutes = express.Router();

import {
  sendVerificationMail,
  verifyOTP,
  homepageData,
  handleBalanceTransferToOthers,
  handleUserSignup,
  createUser,
} from "../../controller/user/userController.js";

userRoutes.post("/create-user", createUser);
userRoutes.post("/signup", handleUserSignup);
userRoutes.post("/send-otp", sendVerificationMail);
userRoutes.post("/verify-otp", verifyOTP);
userRoutes.get("/mail", sendVerificationMail);
userRoutes.get("/homepage-data", homepageData);
userRoutes.get("/transfer-balance", handleBalanceTransferToOthers);

export default userRoutes;
