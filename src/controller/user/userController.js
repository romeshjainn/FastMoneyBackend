const { collection, getDocs } = require("firebase/firestore");
const { sendEmail } = require("./mail");
const { db } = require("../../config/firebase");
const ejs = require("ejs");
const path = require("path");

// getting the html template form .ejs file
async function getEmailTemp(otp) {
  try {
    const htmlContent = await ejs.renderFile(
      path.join(__dirname, "../utils/emailTemplate.ejs"),
      { otp: otp }
    );
    return htmlContent;
  } catch (error) {
    console.error("Error rendering email template: ", error);
    throw error;
  }
}

// email verification
const otpExpirationTime = 60000; 
let otpData = {}; 

async function sendVerificationMail(req, res) {
  try {
    const { email } = req.body;
    console.log(email, "email");

    const otp = Math.floor(Math.random() * 90000) + 10000;
    const html = await getEmailTemp(otp);
    await sendEmail(email, "Verification Mail", "", html);
    console.log(otp);
    otpData = {
      otp: otp,
      createdAt: Date.now(),
    };

    console.log(otp, "otp verified");
    res.status(200).json({ success: "Mail sent successfully", otp: otp });

    setTimeout(() => {
      otpData = {};
    }, otpExpirationTime);
  } catch (error) {
    console.error("Error sending mail: ", error);
    res.status(500).json({ error: "Failed to send verification mail" });
  }
}

async function verifyOTP(req, res) {
  try {
    const { otp } = req.query;
    console.log(otp);
    if (
      otpData &&
      Number(otpData.otp) === Number(otp) &&
      Date.now() - otpData.createdAt <= otpExpirationTime
    ) {
      res
        .status(200)
        .json({ success: true, message: "OTP verified successfully" });
    } else {
      res.status(400).json({ error: "Invalid or expired OTP" });
    }
  } catch (error) {
    console.error("Error verifying OTP: ", error);
    res.status(500).json({ success: false, error: "Failed to verify OTP" });
  }
}

// getting data from db
async function getCollection(req, res) {
  try {
    const workRecord = collection(db, "users");
    const workSnapshot = await getDocs(workRecord);
    const record = workSnapshot.docs.map((doc) => doc.data());

    res.status(200).json(record);
  } catch (error) {
    console.error("Error fetching collection from Firestore: ", error);
    res.status(500).json({ error: "Failed to fetch collection" });
  }
}

async function getUserData(req, res) {
  try {
    console.log(req.body);
  } catch (error) {
    console.error("Error fetching collection from Firestore: ", error);
    res.status(500).json({ error: "Failed to fetch collection" });
  }
}

module.exports = {
  getCollection,
  sendVerificationMail,
  getUserData,
  verifyOTP,
};
