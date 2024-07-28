import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  updateDoc,
  arrayUnion,
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
import axios from "axios";

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

// async function saveUser(req, res) {
//   try {
//     const userCollection = collection(db, "users");

//     // const docRef = await addDoc(userCollection,data);
//     await Promise.all(
//       data.map(async (user) => {
//         await addDoc(userCollection, user);
//       })
//     );
//     console.log("Data successfully written to Firestore!");
//     res.status(200).json({ success: "user saved successfully" });
//   } catch (error) {
//     console.log(error);
//   }
// }

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

export const signUp = async (req, res) => {
  try {
    const userData = req.body;
    if (!userData) {
      return res.status(400).json({ error: "User data is required" });
    }

    const usersCollectionRef = collection(db, "users");

    const docRef = await addDoc(usersCollectionRef, userData);

    res
      .status(200)
      .json({ message: "User data added successfully", docId: docRef.id });
  } catch (error) {
    console.error("Error adding document to Firestore: ", error);
    res.status(500).json({ error: "Failed to add data" });
  }
};

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
      (user) => String(user.userDetails.user_id) === String(id)
    )[0];

    const refers = userRecord ? userRecord.referredTeam : [];
    res.send({ refers });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "An error occurred" });
  }
};

export const allTransactions = async (req, res) => {
  try {
    const { id } = req.query;
    const workRecord = collection(db, "users");
    const workSnapshot = await getDocs(workRecord);
    const record = workSnapshot.docs.map((doc) => doc.data());

    const userRecord = record.filter(
      (user) => String(user.userDetails.user_id) === String(id)
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
      (user) => String(user.userDetails.user_id) === String(id)
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
      (user) => String(user.userDetails.user_id) === String(id)
    )[0];

    const creditCardDetails = userRecord.creditCardDetails;

    res.send({ creditCardDetails });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "An error occurred" });
  }
};

export const rewards = async (req, res) => {
  try {
    const { id } = req.query;
    const workRecord = collection(db, "users");
    const workSnapshot = await getDocs(workRecord);
    const record = workSnapshot.docs.map((doc) => doc.data());
    const userRecord = record.filter(
      (user) => String(user.userDetails.user_id) === String(id)
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
      pan: user?.[0]?.userDetails?.pan || "",
      aadhar: user?.[0]?.userDetails?.aadhar || "",
      emp_type: user?.[0]?.userDetails?.emp_type || "",
      annual_income: user?.[0]?.userDetails?.annual_income || "",
    };

    res.send(userDetails);
    // res.send({ user });
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
      (user) => String(user.userDetails.user_id) === String(id)
    )[0];

    const allTransactions = userRecord ? userRecord.rewardsHistory : [];
    res.send({ allTransactions });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "An error occurred" });
  }
};

export const addTransaction = async (req, res) => {
  try {
    const data = req.body;

    if (!validateTransactionData(data)) {
      return res.status(400).json({ error: "Invalid transaction data" });
    }

    const transactionId = generateTransactionId();

    const transaction = {
      ...data,
      transaction_id: transactionId,
      transaction_amount: parseFloat(data.transaction_amount),
    };

    const userDocRef = doc(db, "users", data.to);
    const userDoc = await getDocs(userDocRef);

    if (!userDoc.exists()) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    const updatedTransactionHistory = userData.transactionHistory || [];
    updatedTransactionHistory.push(transaction);

    await updateDoc(userDocRef, {
      transactionHistory: updatedTransactionHistory,
    });

    res
      .status(200)
      .json({ message: "Transaction added successfully", transactionId });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ error: "Failed to add transaction" });
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
    const { toPerson, balance, number } = req.body;

    if (!toPerson || !balance || !number) {
      return res.status(400).send({ error: "Required fields are missing" });
    }

    const workRecord = collection(db, "users");
    const workSnapshot = await getDocs(workRecord);
    const records = workSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const currentUser = records.find(
      (user) => user.userDetails.number === number
    );
    const recipientUser = records.find(
      (user) => user.userDetails.number === toPerson
    );

    if (!currentUser) {
      return res.status(404).send({ error: "Current user not found" });
    }

    if (!recipientUser) {
      return res.status(404).send({ error: "Recipient user not found" });
    }

    if (currentUser.balance < balance) {
      return res.status(400).send({ error: "Insufficient balance" });
    }

    const transactionId = generateTransactionId();

    await updateDoc(doc(db, "users", currentUser.id), {
      balance: currentUser.balance - balance,
      transactions: [
        ...(currentUser.transactions || []),
        {
          to: recipientUser.userDetails.number,
          transaction_id: transactionId,
          transaction_amount: balance,
          transaction_date: Timestamp.now(),
          transaction_type: "Debit",
          description: "Transfer to another user",
        },
      ],
    });

    await updateDoc(doc(db, "users", recipientUser.id), {
      balance: recipientUser.balance + balance,
      transactions: [
        ...(recipientUser.transactions || []),
        {
          to: currentUser.userDetails.number,
          transaction_id: transactionId,
          transaction_amount: balance,
          transaction_date: Timestamp.now(),
          transaction_type: "Credit",
          description: "Received from another user",
        },
      ],
    });

    res.send({
      message: "Balance transferred successfully",
      transaction_id: transactionId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "An error occurred" });
  }
};

// export const createUser = async (req, res) => {
//   try {
//     const { number, ref } = req.body;

//     const allUsers = await getFirebaseData();

//     if (!allUsers.success) {
//       return res.status(500).send("Error fetching users");
//     }

//     const userExist = allUsers.data.filter(
//       (user) => String(user.userDetails.number) === String(number)
//     );

//     const referredBy = allUsers.data.filter(
//       (user) => String(user.userDetails.id) === String(ref)
//     );
//     let referrerName = null;
//     if (ref) {
//       const referrer = allUsers.data.filter(
//         (user) => user.userDetails.id === ref
//       );
//       if (referrer.length > 0) {
//         referrerName = referrer[0].userDetails.name;
//       }
//     }

//     const now = new Date();
//     const formattedDate = format(now, "dd-MMMM-yyyy");
//     const formattedTime = format(now, "hh:mm a");

//     if (userExist.length > 0) {
//       return res
//         .status(400)
//         .send({ Error: "User Exist", length: userExist.length });
//     } else {
//       const updatedUserDataSchema = {
//         ...userSchema,
//         userDetails: {
//           ...userSchema.userDetails,
//           number: number,
//           id: number,
//         },
//         ...(ref && {
//           referredBy: {
//             referrerId: ref,
//             referrerName: referrerName || null,
//             joining_date: formattedDate,
//             joining_time: formattedTime,
//           },
//         }),
//       };

//       const usersCollectionRef = collection(db, "users");
//       const docRef = await addDoc(usersCollectionRef, updatedUserDataSchema);

//       console.log(updatedUserDataSchema, "updatedUserDataSchema");
//       res.json(updatedUserDataSchema);
//     }
//   } catch (error) {
//     console.error(error, "error");
//     res.status(500).send("Internal Server Error");
//   }
// };

export const createUser = async (req, res) => {
  try {
    const { number, ref } = await req.body;

    console.log(number, "number", ref);

    const allUsersSnapshot = await getDocs(collection(db, "users"));
    const allUsers = allUsersSnapshot.docs.map((doc) => doc.data());
    console.log("running");
    if (!allUsers) {
      return res.status(500).send("Error fetching users");
    }

    const userExist = allUsers.filter(
      (user) => String(user.userDetails.number) === String(number)
    );

    // if (userExist) {
    //   return res
    //     .status(500)
    //     .send({ userExist: true, navigationPath: "/homepage" });
    // }

    let referrerDetails = null;
    if (ref) {
      referrerDetails = allUsers.find(
        (user) => String(user.userDetails.id) === String(ref)
      );
      console.log(ref);
      console.log(referrerDetails);
    }

    const now = new Date();
    const formattedDate = format(now, "dd-MMMM-yyyy");
    const formattedTime = format(now, "hh:mm a");

    if (userExist.length > 0) {
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
          id: number,
        },
        ...(ref && {
          referredBy: {
            referrerId: ref,
            referrerName: referrerDetails
              ? referrerDetails.userDetails.name
              : null,
            joining_date: formattedDate,
            joining_time: formattedTime,
          },
        }),
      };

      const usersCollectionRef = collection(db, "users");
      const docRef = await addDoc(usersCollectionRef, updatedUserDataSchema);

      if (referrerDetails) {
        const referrerDocRef = doc(db, "users", referrerDetails.userDetails.id);
        const newReferredTeamMember = {
          team_member_id: number,
          team_member_name: updatedUserDataSchema.userDetails.name,
        };

        await updateDoc(referrerDocRef, {
          referredTeam: [
            ...(referrerDetails.referredTeam || []),
            newReferredTeamMember,
          ],
        });
      }

      res.json({
        userExist: false,
        // navigationPath: "/signup",
        navigationPath: "/signup",
        message: "User Created",
        token: number,
      });
      // res.json({
      //   userExist: false,
      //   updatedUserDataSchema,
      //   docRef,
      //   navigationPath: "/signup",
      // });
    }
  } catch (error) {
    console.error(error, "error");
    res.status(500).send("Internal Server Error");
  }
};

export const handleUserSignup = async (req, res) => {
  try {
    const { number, data } = req.body;

    if (!number || !data) {
      return res.status(400).send({ Error: "Missing number or data" });
    }

    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("userDetails.number", "==", number));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).send({ Error: "User not found" });
    }

    const userDoc = querySnapshot.docs[0];
    const userDocRef = doc(db, "users", userDoc.id);

    await updateDoc(userDocRef, {
      userDetails: {
        ...userDoc.data().userDetails,
        ...data,
      },
    });

    res.status(200).send({ message: "User data updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Server Error");
  }
};

export const sendMoneyPeopleSuggestions = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name parameter is required" });
    }

    const allUsersData = await getFirebaseData();
    const { data } = allUsersData;

    const suggestions = data
      .map((item) => {
        return item.transactionHistory.filter((transaction) => {
          return (
            (transaction.toName &&
              transaction.toName.toLowerCase().includes(name.toLowerCase())) ||
            (transaction.toNumber &&
              transaction.toNumber.toLowerCase().includes(name.toLowerCase()))
          );
        });
      })
      .flat();

    let details = [];

    if (suggestions.length) {
      details = suggestions.map((item) => {
        return {
          name: item.toName,
          number: item.toNumber,
        };
      });
    }

    res.status(200).json(Success(details));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const saveContacts = async (req, res) => {
  try {
    const { number, contacts } = req.body;
    if (!contacts || !number) {
      return res.status(400).send({ Error: "Missing contacts or data" });
    }

    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("userDetails.number", "==", number));
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
    const { cardDetails, number } = req.body;

    // Validate input
    if (
      !cardDetails ||
      !cardDetails.card_ ||
      !cardDetails.card_type ||
      !cardDetails.expiry_date ||
      !cardDetails.cvv ||
      !number
    ) {
      return res.status(400).send({ Error: "Missing card details or number" });
    }

    // Query to find user with the given card number
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("userDetails.number", "==", number));
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
    const { bankDetails, number } = req.body;

    if (!bankDetails || !number) {
      return res.status(400).send({ Error: "Missing bank details or number" });
    }

    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("userDetails.number", "==", number));
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
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
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
  const { requestId, otp, number } = req.body;
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
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.data && data.data.full_name && data.data.full_name.length > 0) {
      
      const usersCollection = collection(db, "users");
      const q = query(
        usersCollection,
        where("userDetails.number", "==", number)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return res.status(404).send({ Error: "User not found" });
      }

      const userDoc = querySnapshot.docs[0];
      const userDocRef = doc(db, "users", userDoc.id);

      await updateDoc(userDocRef, {
        aadharData: {
          name: data.data.full_name,
          dob: data.data.dob,
          address: data.data.address,
        },
      });

      res.json({ success: true, message: "Aadhar Verified Successfully" });
    } else {
      res.json({ success: false, message: "Aadhar Verification Failed" });
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while verifying the Aadhaar card" });
  }
};
