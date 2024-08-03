import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  updateDoc,
  arrayUnion,
  getCountFromServer,
} from "firebase/firestore";
import { sendEmail } from "./mail.js";
import { db } from "../../config/firebase.js";
import ejs from "ejs";
import path from "path";
import { generateTransactionId } from "../../utils/user/generateTransactionId.js";
import { validateTransactionData } from "../../utils/user/validateTransaction.js";
import { userSchema } from "./schema.js";
import { Success, Error } from "../../utils/user/asyncResponse.js";
import { format } from "date-fns";
import { generateReferId } from "../../utils/user/referIdGenerator.js";
import { userIdGenerator } from "../../utils/user/userIdGenerator.js";

// getting the html template form .ejs file
export async function getEmailTemp(otp) {
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

const getFirebaseData = async () => {
  try {
    const workRecord = collection(db, "users");
    const workSnapshot = await getDocs(workRecord);
    const record = workSnapshot.docs.map((doc) => doc.data());
    return Success(record);
  } catch (error) {
    return Error(error);
  }
};

async function getCollectionSize() {
  try {
    const collectionRef = collection(db, "users");
    const snapshot = await getCountFromServer(collectionRef);
    return snapshot.data().count;
  } catch (error) {
    return null;
  }
}
export async function sendVerificationMail(req, res) {
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

export async function verifyOTP(req, res) {
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

// new controllers

export const homepageData = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).send({ error: "User ID is required" });
    }

    const workRecord = collection(db, "users");
    const workSnapshot = await getDocs(workRecord);
    const records = workSnapshot.docs.map((doc) => doc.data());

    const userRecord = records.find(
      (user) => String(user.userDetails.id) === String(id)
    );

    if (!userRecord) {
      return res.status(404).send({ error: "User not found" });
    }

    const walletBalance = userRecord.wallet?.balance || 0;
    const transactions = userRecord.transactionHistory?.slice(0, 5) || [];
    const creditCardDetails = userRecord.creditCardDetails || [];
    const creditScore = userRecord.userDetails?.credit_score || 0;
    const totalRewards = userRecord.userDetails?.rewards?.total_rewards || 0;

    res.send({
      name: userRecord.userDetails.name,
      walletBalance,
      transactions,
      creditCardDetails,
      creditScore,
      totalRewards,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "An internal server error occurred" });
  }
};

export const referralData = async (req, res) => {
  try {
    const { id } = req.query;
    const workRecord = collection(db, "users");
    const workSnapshot = await getDocs(workRecord);
    const record = workSnapshot.docs.map((doc) => doc.data());

    const userRecord = record.filter(
      (user) => String(user.userDetails.id) === String(id)
    )[0];

    const refers = userRecord ? userRecord.referredTeam : [];
    res.send({ refers });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "An error occurred" });
  }
};

export const tansactionDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const workRecord = collection(db, "users");
    const workSnapshot = await getDocs(workRecord);
    const record = workSnapshot.docs.map((doc) => doc.data());

    const userRecord = record.filter(
      (user) => String(user.userDetails.id) === String(id)
    )[0];

    const allTransactions = userRecord ? userRecord.transactionsRecord : [];
    res.send({ allTransactions });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "An error occurred" });
  }
};

export const bankDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const workRecord = collection(db, "users");
    const workSnapshot = await getDocs(workRecord);
    const record = workSnapshot.docs.map((doc) => doc.data());
    const userRecord = record.filter(
      (user) => String(user.userDetails.id) === String(id)
    )[0];

    const bankDetails = userRecord.bankDetails;

    res.send({ bankDetails });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "An error occurred" });
  }
};

export const creditCardDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const workRecord = collection(db, "users");
    const workSnapshot = await getDocs(workRecord);
    const record = workSnapshot.docs.map((doc) => doc.data());
    const userRecord = record.filter(
      (user) => String(user.userDetails.id) === String(id)
    )[0];

    const creditCardDetails = userRecord.creditCardDetails;

    res.send({ creditCardDetails });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "An error occurred" });
  }
};

export const rewardDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const workRecord = collection(db, "users");
    const workSnapshot = await getDocs(workRecord);
    const record = workSnapshot.docs.map((doc) => doc.data());
    const userRecord = record.filter(
      (user) => String(user.userDetails.id) === String(id)
    )[0];

    const rewardsHistory = userRecord.rewardsHistory;

    res.send({ rewardsHistory });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "An error occurred" });
  }
};

export const userDetails = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).send({ error: "User ID is required" });
    }

    const { data } = await getFirebaseData();

    const user = data.filter((user) => user.userDetails.id === id);

    if (!user.length) {
      return res.status(404).send({ error: "User not found" });
    }

    // const userRecord = workSnapshot.docs[0].data();
    console.log(user);
    console.log(user?.userDetails);

    const userDetails = {
      name: user?.[0]?.userDetails?.name || "",
      number: user?.[0]?.userDetails?.number || "",
      email: user?.[0]?.userDetails?.email || "",
      panNumber: user?.[0]?.userDetails?.pan || "",
      aadharNumber: user?.[0]?.userDetails?.aadhar || "",
      employmentType: user?.[0]?.userDetails?.emp_type || "",
      income: user?.[0]?.userDetails?.annual_income || "",
      referredBy: user?.[0]?.referredBy?.referrerName || "",
    };

    res.send(userDetails);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "An error occurred" });
  }
};

export const allRewards = async (req, res) => {
  try {
    const { id } = req.query;
    const workRecord = collection(db, "users");
    const workSnapshot = await getDocs(workRecord);
    const record = workSnapshot.docs.map((doc) => doc.data());

    const userRecord = record.filter(
      (user) => String(user.userDetails.id) === String(id)
    )[0];

    const allTransactions = userRecord ? userRecord.rewardsHistory : [];
    res.send({ allTransactions });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "An error occurred" });
  }
};

export const getPeoplesSuggestion = async (req, res) => {
  try {
    const { name, number } = req.body;
    const workRecord = collection(db, "users");
    const workSnapshot = await getDocs(workRecord);
    const record = workSnapshot.docs.map((doc) => doc.data());

    const peoples =
      record.filter(
        (user) =>
          user.userDetails.name === name || user.userDetails.number === number
      ) || [];

    res.send({ peoples });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "An error occurred" });
  }
};

export const handleBalanceTransferToOthers = async (req, res) => {
  try {
    const { toPerson, balance, id, pin } = req.body;

    if (!toPerson || !balance || !id) {
      return res.status(400).send({ error: "Required fields are missing" });
    }

    const workRecord = collection(db, "users");
    const workSnapshot = await getDocs(workRecord);
    const records = workSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const currentUser = records.find((user) => user.userDetails.id === id);
    const recipientUser = records.find(
      (user) => user.userDetails.number === toPerson
    );

    if (!currentUser) {
      return res
        .status(404)
        .send({ success: "false", error: "Current user not found" });
    }

    if (!recipientUser) {
      return res
        .status(404)
        .send({ success: "false", error: "Recipient user not found" });
    }

    if (currentUser.userDetails.pin === pin) {
      return res.status(404).send({ success: "false", error: "Pin Is Wrong" });
    }

    if (parseFloat(currentUser.wallet.balance) < parseFloat(balance)) {
      return res
        .status(400)
        .send({ success: "false", error: "Insufficient balance" });
    }

    const transactionId = generateTransactionId();

    const now = new Date();
    const formattedDate = format(now, "dd-MMMM-yyyy");
    const formattedTime = format(now, "hh:mm a");

    await updateDoc(doc(db, "users", currentUser.id), {
      "wallet.balance":
        parseFloat(currentUser.wallet.balance) - parseFloat(balance),
      transactions: [
        ...(currentUser.transactions || []),
        {
          to: recipientUser.userDetails.number,
          transaction_id: transactionId,
          transaction_amount: parseFloat(balance),
          transaction_date: formattedDate,
          transaction_time: formattedTime,
          transaction_type: "Debit",
          description: "Transfer to another user",
        },
      ],
    });

    await updateDoc(doc(db, "users", recipientUser.id), {
      "wallet.balance":
        parseFloat(recipientUser.wallet.balance) + parseFloat(balance),
      transactions: [
        ...(recipientUser.transactions || []),
        {
          to: currentUser.userDetails.number,
          transaction_id: transactionId,
          transaction_amount: parseFloat(balance),
          transaction_date: formattedDate,
          transaction_time: formattedTime,
          transaction_type: "Credit",
          description: "Received from another user",
        },
      ],
    });

    res.send({
      success: "true",
      message: "Balance transferred successfully",
      transaction_id: transactionId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: "false", error: "An error occurred" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { number, id } = await req.body;

    console.log(number, id);
    const allUsersSnapshot = await getDocs(collection(db, "users"));
    const allUsers = allUsersSnapshot.docs.map((doc) => doc.data());

    if (!allUsers) {
      return res.status(500).send("Error fetching users");
    }

    const userExist = allUsers.filter(
      (user) => String(user.userDetails.number) === String(number)
    );

    if (userExist.length > 0) {
      console.log({
        userExist: true,
        navigationPath: "/homepage",
        message: "User Exist",
        token: userExist[0].userDetails.id,
      });
      return res.status(400).send({
        userExist: true,
        navigationPath: "/homepage",
        message: "User Exist",
        token: userExist[0].userDetails.id,
      });
    } else {
      const updatedUserDataSchema = {
        ...userSchema,
        userDetails: {
          ...userSchema.userDetails,
          number: number,
          id: id,
        },
      };

      const usersCollectionRef = collection(db, "users");
      const docRef = await addDoc(usersCollectionRef, updatedUserDataSchema);

      console.log({
        userExist: false,
        navigationPath: "/signup",
        message: "User Created",
        token: number,
        docRef,
      });

      res.json({
        userExist: false,
        navigationPath: "/signup",
        message: "User Created",
        token: number,
        docRef,
      });
    }
  } catch (error) {
    console.error(error, "error");
    res.status(500).send("Internal Server Error");
  }
};

export const handleUserSignup = async (req, res) => {
  try {
    const { id, data, referrerId, mobileNumber, nameOfAadhar } = req.body;

    if (!id || !data) {
      return res
        .status(400)
        .send({ success: false, Error: "Missing id or data" });
    }

    const obj = {
      tempAddress: data.address,
      aadhar: data.aadharCardNumber,
      pan: data.panCardNumber,
      emp_type: data.employmentType,
      annual_income: data.annualIncome,
      walletPin: data.walletPin,
    };

    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("userDetails.id", "==", id));

    // Log query and collection details
    console.log("Query:", q);
    console.log("Users Collection:", usersCollection);

    const querySnapshot = await getDocs(q);

    // Log query results
    console.log("Query Snapshot:", querySnapshot);

    if (querySnapshot.empty) {
      console.log("User Not Found:", verifyUserId);
      return res.status(404).send({ Error: "User not found" });
    }

    const userDoc = querySnapshot.docs[0];
    const userDocRef = doc(db, "users", userDoc.id);

    const now = new Date();
    const formattedDate = format(now, "dd-MMMM-yyyy");
    const formattedTime = format(now, "hh:mm a");

    let referrerDetails = null;
    if (referrerId) {
      const { data } = await getFirebaseData();
      referrerDetails = data.find(
        (user) => String(user.userDetails.referID) === String(referrerId)
      );

      const referrerQuery = query(
        usersCollection,
        where("userDetails.referID", "==", referrerId)
      );
      const referrerQuerySnapshot = await getDocs(referrerQuery);

      if (referrerQuerySnapshot.empty) {
        console.log("Referrer Not Found:", referrerId);
      } else {
        const referrerDoc = referrerQuerySnapshot.docs[0];
        const referrerDocRef = doc(db, "users", referrerDoc.id);

        await updateDoc(referrerDocRef, {
          referredTeam: arrayUnion({
            name: nameOfAadhar,
            number: mobileNumber,
            joining_date: formattedDate,
            joining_time: formattedTime,
          }),
        });
      }
    }

    await updateDoc(userDocRef, {
      userDetails: {
        ...userDoc.data().userDetails,
        ...obj,
        joining_date: formattedDate,
        joining_time: formattedTime,
      },
      ...(referrerId &&
        referrerDetails && {
          referredBy: {
            referrerId: referrerId,
            referrerName: referrerDetails.userDetails.name || "",
          },
        }),
    });

    // if (referrerDetails) {
    //   const referrerDocRef = doc(db, "users", referrerDetails.userDetails.id);
    //   const newReferredTeamMember = {
    //     team_member_id: mobileNumber,
    //     team_member_name: updatedUserDataSchema.userDetails.name,
    //     joining_date: formattedDate,
    //     joining_time: formattedTime,
    //   };

    //   await updateDoc(referrerDocRef, {
    //     referredTeam: [
    //       ...(referrerDetails.referredTeam || []),
    //       newReferredTeamMember,
    //     ],
    //   });
    // }

    res
      .status(200)
      .send({ success: true, message: "User data updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Server Error");
  }
};

export const sendMoneyPeopleSuggestions = async (req, res) => {
  try {
    const { searchQuery } = req.body;

    if (!searchQuery) {
      return res.status(400).json({ error: "Name parameter is required" });
    }

    const allUsersData = await getFirebaseData();
    const { data } = allUsersData;
    if (data.length) {
      const suggestions = data.filter(
        (user) =>
          user.userDetails.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          user.userDetails.number
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );

      console.log(suggestions, "suggestions");

      let details = [];

      if (suggestions.length) {
        details = suggestions.map((item) => {
          return {
            name: item.userDetails.name,
            number: item.userDetails.number,
          };
        });
      }

      res
        .status(200)
        .json({ success: true, details: details, contacts: data.contacts });
    } else {
      res.status(400).json({ success: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const saveContacts = async (req, res) => {
  try {
    const { id, contacts } = req.body;
    if (!contacts || !id) {
      return res.status(400).send({ Error: "Missing contacts or data" });
    }

    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("userDetails.id", "==", id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).send({ Error: "User not found" });
    }

    const userDoc = querySnapshot.docs[0];
    const userDocRef = doc(db, "users", userDoc.id);

    await updateDoc(userDocRef, {
      contacts: arrayUnion(...contacts),
    });

    res.status(200).send({ message: "Contacts updated successfully" });
  } catch (error) {
    console.error("Error adding contacts:", error);
    res.status(500).send("Server Error");
  }
};

export const saveCreditCard = async (req, res) => {
  try {
    const { cardDetails, id } = req.body;

    // Validate input
    if (
      !cardDetails ||
      !cardDetails.card_ ||
      !cardDetails.card_type ||
      !cardDetails.expiry_date ||
      !cardDetails.cvv ||
      !id
    ) {
      return res.status(400).send({ Error: "Missing card details or id" });
    }

    // Query to find user with the given card id
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("userDetails.id", "==", id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).send({ Error: "User not found" });
    }

    const userDoc = querySnapshot.docs[0];
    const userDocRef = doc(db, "users", userDoc.id);

    // Update the user's document to add new card details
    await updateDoc(userDocRef, {
      creditCardDetails: arrayUnion(cardDetails), // Add the cardDetails object to the array
    });

    res.status(200).send({ message: "Card updated successfully" });
  } catch (error) {
    console.error("Error adding Card:", error);
    res.status(500).send({ Error: "Server Error" });
  }
};

export const saveBankDetails = async (req, res) => {
  try {
    const { bankDetails, id } = req.body;
    console.log(bankDetails, id);
    if (!bankDetails || !id) {
      return res.status(400).send({ Error: "Missing bank details or id" });
    }

    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("userDetails.id", "==", id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).send({ Error: "User not found" });
    }

    const userDoc = querySnapshot.docs[0];
    const userDocRef = doc(db, "users", userDoc.id);

    await updateDoc(userDocRef, {
      bankDetails: arrayUnion(bankDetails),
    });

    res.status(200).send({ message: "bank updated successfully" });
  } catch (error) {
    console.error("Error adding bank:", error);
    res.status(500).send({ Error: "Server Error" });
  }
};

export const sendAadharOtp = async (req, res) => {
  const { aadharNumber } = req.body;
  try {
    const response = await fetch(
      "https://api.quickekyc.com/api/v1/aadhaar-v2/generate-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: process.env.QuickKycKey,
          id_number: aadharNumber,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Response error:", errorData);
      return res
        .status(response.status)
        .json({ error: "Failed to generate OTP" });
    }

    const data = await response.json();
    console.log("Response data:", data);

    const requestId = data.request_id;
    res.json({ request_id: requestId });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while verifying the Aadhaar card" });
  }
};

export const verifyAadharCard = async (req, res) => {
  const { requestId, otp, id, aadharNumber } = req.body;
  console.log(requestId, otp, id, aadharNumber);
  try {
    const response = await fetch(
      "https://api.quickekyc.com/api/v1/aadhaar-v2/submit-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: process.env.QuickKycKey,
          request_id: requestId,
          otp: otp,
        }),
      }
    );

    if (!response.ok) {
      console.log(response);
    }

    const data = await response.json();
    console.log(data, "data");

    if (data.data && data.data.full_name && data.data.full_name.length > 0) {
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("userDetails.id", "==", id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return res.status(404).send({ Error: "User not found" });
      }

      const userDoc = querySnapshot.docs[0];
      const userDocRef = doc(db, "users", userDoc.id);
      const colLength = await getCollectionSize();
      let referID = "";
      if (colLength) {
        const id = generateReferId(data.data.full_name, colLength, "colLength");
        referID = id;
      } else {
        const id = generateReferId(data.data.full_name, aadharNumber, "aadhar");
        referID = id;
      }

      await updateDoc(userDocRef, {
        "userDetails.referID": referID,
        aadharData: {
          name: data.data.full_name,
          dob: data.data.dob,
          address: data.data.address,
        },
      });

      console.log(data, "data");
      res.json({
        success: true,
        message: "Aadhar Verified Successfully",
        data,
      });
    } else {
      res.json({
        success: false,
        message: "Aadhar Verification Failed",
        data,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while verifying the Aadhaar card" });
  }
};

export const saveCreditCardDetails = async (req, res) => {
  try {
    const { creditCardDetails, id } = req.body;

    console.log(creditCardDetails, id);
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("userDetails.id", "==", id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).send({ Error: "User not found" });
    }

    const userDoc = querySnapshot.docs[0];
    const userDocRef = doc(db, "users", userDoc.id);

    await updateDoc(userDocRef, {
      creditCards: arrayUnion(creditCardDetails),
    });
    res.json({
      success: true,
      message: "Card Added Successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while verifying the Aadhaar card" });
  }
};

export const verifyPanNumber = async (req, res) => {
  const { panCardNumber } = req.body;
  try {
    const response = await fetch("https://api.quickekyc.com/api/v1/pan/pan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: process.env.QuickKycKey,
        id_number: panCardNumber,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Response error:", errorData);
      return res
        .status(response.status)
        .json({ success: false, error: "Failed to generate OTP" });
    }

    const data = await response.json();
    console.log("Response data:", data);

    if (data.status === "error") {
      res.json({ success: false, nameOnPanCard: "", status: "failed" });
    } else {
      const nameOnPanCard = data.data.full_name;
      const category = data.data.person;
      res.json({ success: true, nameOnPanCard, category });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while verifying the Aadhaar card",
    });
  }
};

export const sendOtp = async (req, res) => {
  const { data } = req.body;
  try {
    const response = await fetch("https://auth.otpless.app/auth/otp/v1/send", {
      method: "POST",
      headers: {
        clientId: "YOUR_CLIENT_ID",
        clientSecret: "YOUR_CLIENT_SECRET",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: data.number,
        orderId: "ORDER_ID(optional)",
        // hash: "MOBILE_APPLICATION_HASH(optional)",
        otpLength: 6,
        channel: "SMS",
        expiry: 60,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Response error:", errorData);
      return res
        .status(response.status)
        .json({ error: "Failed to generate OTP" });
    }

    const data = await response.json();
    console.log("Response data:", data);

    if (data.status === "error") {
      res.json({ status: "success", nameOnPanCard: "", status: "failed" });
    } else {
      const nameOnPanCard = data.data.full_name;
      const category = data.data.person;
      res.json({ status: "failed", nameOnPanCard, category });
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while verifying the Aadhaar card" });
  }
};

export const raiseAComplaint = async (req, res) => {
  try {
    const { id, type, data } = req.body;
    console.log(id, type, data);

    // Validate the type to be one of the allowed keys
    const allowedTypes = [
      "updateDetailsRequest",
      "issueWithTransactions",
      "complaint",
    ];
    if (!allowedTypes.includes(type)) {
      return res.status(400).send({ Error: "Invalid type" });
    }

    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("userDetails.id", "==", id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).send({ Error: "User not found" });
    }

    const userDoc = querySnapshot.docs[0];
    const userDocRef = doc(db, "users", userDoc.id);

    // Update the specific array based on the type
    await updateDoc(userDocRef, {
      [`complaint.${type}`]: arrayUnion(data),
    });

    res.status(200).send({ message: "Bank details updated successfully" });
  } catch (error) {
    console.error("Error updating bank details:", error);
    res.status(500).send({ Error: "Server Error" });
  }
};

export const accountDetails = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).send({ error: "User ID is required" });
    }

    const records = getFirebaseData();

    const userRecord = records.find(
      (user) => String(user.userDetails.id) === String(id)
    );

    if (!userRecord) {
      return res.status(404).send({ error: "User not found" });
    }

    res.send({
      success: true,
      data: userRecord.userDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "An internal server error occurred" });
  }
};
