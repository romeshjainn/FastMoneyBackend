const { collection, getDocs } = require("firebase/firestore");
const { db } = require("../config/firebase");

// Get entire collection from Firestore
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

module.exports = {
  getCollection,
};
