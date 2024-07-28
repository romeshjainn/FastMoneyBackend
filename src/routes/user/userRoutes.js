import express from "express";
const userRoutes = express.Router();

import {
  sendVerificationMail,
  verifyOTP,
  homepageData,
  handleBalanceTransferToOthers,
  handleUserSignup,
  createUser,
  sendMoneyPeopleSuggestions,
  userDetails,
  saveContacts,
  saveCreditCard,
} from "../../controller/user/userController.js";

userRoutes.post("/create-user", createUser);
userRoutes.post("/signup", handleUserSignup);
userRoutes.post("/send-otp", sendVerificationMail);
userRoutes.post("/verify-otp", verifyOTP);
userRoutes.get("/mail", sendVerificationMail);
userRoutes.get("/homepage-data", homepageData);
userRoutes.get("/user-details", userDetails);
userRoutes.get("/transfer-balance", handleBalanceTransferToOthers);
userRoutes.post("/send-money-suggestions", sendMoneyPeopleSuggestions);
userRoutes.post("/save-contacts", saveContacts);
userRoutes.post("/save-credit-card", saveCreditCard);
userRoutes.post("/save-bank-details", saveCreditCard);

export default userRoutes;
