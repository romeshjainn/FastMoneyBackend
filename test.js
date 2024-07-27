const data = [
  {
    transactionHistory: [
      {
        transaction_time: "",
        transaction_id: "",
        description: "",
        transaction_amount: "",
        transaction_type: "",
        to: "",
        transaction_date: "",
      },
    ],
    userDetails: {
      company_name: "",
      gender: "",
      credit_score: 0,
      profile_picture: "",
      aadhar: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        postal_code: "",
      },
      job_title: "",
      email: "",
      emp_type: "",
      annual_income: 0,
      pan: "",
      date_of_birth: "",
      id: "1212121211",
      name: "Romesh",
      verification_status: "",
      number: "1212121211",
    },
    transactionsRecord: [
      {
        person_id: "",
        transaction_date: "",
        toName: "some",
        transaction_time: "",
        toNumber: "9303449658",
        transaction_amount: "",
      },
    ],
    rewardsHistory: [
      {
        reward_id: "",
        reward_amount: "",
        reward_name: "",
        date_earned: "",
      },
    ],
    sessionHistory: [
      {
        time_spent: "",
        end_time: "",
        start_time: "",
        date: "",
      },
    ],
    triggerMessageTo: ["ADMIN", "SUPERADMIN"],
    referredBy: {
      referrerName: "Romesh Jain",
      joining_time: "11:02 PM",
      referrerId: "9516949156",
      joining_date: "25-July-2024",
    },
    referredTeam: [
      {
        team_member_name: "",
        team_member_id: "",
      },
    ],
    bankDetails: [
      {
        account_: "",
        branch: "",
        ifsc_code: "",
        bank_name: "",
      },
    ],
    userSettings: {
      language_preference: "",
    },
    rewards: {
      currency_symbol: "",
      total_rewards: "",
    },
    wallet: {
      balance: 100,
      currency_symbol: "",
    },
    creditCardDetails: [
      {
        card_: "",
        card_type: "",
        expiry_date: "",
        cvv: "",
      },
    ],
  },
  {
    transactionHistory: [
      {
        transaction_type: "",
        transaction_amount: "",
        toName: "Romesh",
        transaction_id: "",
        transaction_date: "",
        transaction_time: "",
        toNumber: "9516949156",
        description: "",
      },
    ],
    transactionsRecord: [
      {
        transaction_amount: "",
        transaction_time: "",
        person_id: "",
        transaction_date: "",
        name: "",
      },
    ],
    userSettings: {
      language_preference: "",
    },
    referredBy: {
      referrerName: "",
      joining_date: "",
      referrerId: "",
      joining_time: "",
    },
    triggerMessageTo: ["ADMIN", "SUPERADMIN"],
    bankDetails: [
      {
        bank_name: "",
        ifsc_code: "",
        branch: "",
        account_: "",
      },
    ],
    creditCardDetails: [
      {
        cvv: "",
        card_: "",
        expiry_date: "",
        card_type: "",
      },
    ],
    sessionHistory: [
      {
        date: "",
        start_time: "",
        time_spent: "",
        end_time: "",
      },
    ],
    rewardsHistory: [
      {
        reward_amount: "",
        date_earned: "",
        reward_name: "",
        reward_id: "",
      },
    ],
    referredTeam: [
      {
        team_member_name: "",
        team_member_id: "",
      },
    ],
    userDetails: {
      credit_score: 0,
      gender: "",
      annualIncome: "300000",
      email: "romeshjainn@gmail.com",
      company_name: "",
      employmentType: "self-employed",
      aadharCardNumber: "1213959403935949",
      number: "9516949156",
      date_of_birth: "",
      id: "9516949156",
      panCardNumber: "ABCDE2129J",
      address: {
        city: "",
        street: "",
        postal_code: "",
        country: "",
        state: "",
      },
      name: "Romesh Jain",
      profile_picture: "",
      annual_income: 0,
      job_title: "",
      pan: "",
      verification_status: "",
      emp_type: "",
      aadhar: "",
    },
    wallet: {
      currency_symbol: "",
      balance: 100,
    },
    rewards: {
      currency_symbol: "",
      total_rewards: "",
    },
  },
];

const detail = "rom";

const filter = data
  .map((item) => {
    return item.transactionHistory.filter((transaction) => {
      return (
        (transaction.toName &&
          transaction.toName.toLowerCase().includes(detail.toLowerCase())) ||
        (transaction.toNumber &&
          transaction.toNumber.toLowerCase().includes(detail.toLowerCase()))
      );
    });
  })
  .flat(); // Flatten the array to get a single-level array of transactions

console.log(filter, "filter");
