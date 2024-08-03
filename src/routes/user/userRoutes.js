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
  raiseAComplaint,
  accountDetails,
  rewardDetails,
  creditCardDetails,
  bankDetails,
  tansactionDetails,
  referralData,
  getComplaints,
} from "../../controller/user/userController.js";

userRoutes.post("/create-user", createUser);
userRoutes.post("/signup", handleUserSignup);
userRoutes.post("/send-otp", sendVerificationMail);
userRoutes.post("/verify-otp", verifyOTP);
userRoutes.get("/mail", sendVerificationMail);
userRoutes.get("/user-details", userDetails);
userRoutes.post("/transfer-balance", handleBalanceTransferToOthers);
userRoutes.post("/contacts-suggestions", sendMoneyPeopleSuggestions);
userRoutes.post("/save-contacts", saveContacts);
userRoutes.post("/send-aadhar-otp", sendAadharOtp);
userRoutes.post("/verify-aadhar-otp", verifyAadharCard);
userRoutes.post("/verify-pan-number", verifyPanNumber);
userRoutes.post("/save-credit-card", saveCreditCardDetails);
userRoutes.post("/save-bank-details", saveBankDetails);
userRoutes.post("/raise-complaint", raiseAComplaint);

// Get Apis
userRoutes.get("/homepage-data", homepageData);
userRoutes.get("/transaction-details", tansactionDetails);
userRoutes.get("/account-details", accountDetails);
userRoutes.get("/bank-details", bankDetails);
userRoutes.get("/credit-details", creditCardDetails);
userRoutes.get("/reward-details", rewardDetails);
userRoutes.get("/referral-details", referralData);
userRoutes.get("/complaint-details", getComplaints);

export default userRoutes;
