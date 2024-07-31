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
  verifyAadharCard,
  sendAadharOtp,
  saveCreditCardDetails,
  saveBankDetails,
  verifyPanNumber,
} from "../../controller/user/userController.js";

userRoutes.post("/create-user", createUser);
userRoutes.post("/signup", handleUserSignup);
userRoutes.post("/send-otp", sendVerificationMail);
userRoutes.post("/verify-otp", verifyOTP);
userRoutes.get("/mail", sendVerificationMail);
userRoutes.get("/homepage-data", homepageData);
userRoutes.get("/user-details", userDetails);
userRoutes.post("/transfer-balance", handleBalanceTransferToOthers);
userRoutes.post("/contacts-suggestions", sendMoneyPeopleSuggestions);
userRoutes.post("/save-contacts", saveContacts);
userRoutes.post("/send-aadhar-otp", sendAadharOtp);
userRoutes.post("/verify-aadhar-otp", verifyAadharCard);
userRoutes.post("/verify-pan-number", verifyPanNumber);
userRoutes.post("/save-credit-card", saveCreditCardDetails);
userRoutes.post("/save-bank-details", saveBankDetails);

export default userRoutes;
