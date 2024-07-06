const schema = {
  basicDetails: {
    name: "",
    phoneNumber: "",
    email: "",
  },
  personalDetails: {
    panNumber: "",
    aadhaarNumber: "",
  },
  employmentDetails: {
    employmentType: "",
    companyName: "",
    annualIncome: "",
  },
  isVerified: true,
  referredBy: {
    referrerName: "",
    referrerId: "",
  },
  myTeam: [],
  creditScoreDetails: {
    creditScorePDF: "",
    creditScore: "",
  },
  userSettings: {
    couponCodes: [
      {
        couponCode: "",
      },
    ],
    creditCardOffers: [
      {
        cardName: "",
        creditLimit: "",
        bankName: "",
      },
    ],
  },
};
