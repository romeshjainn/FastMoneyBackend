export const userSchema = {
  userDetails: {
    id: "",
    name: "",
    number: "",
    email: "",
    pan: "",
    aadhar: "",
    emp_type: "",
    job_title: "",
    company_name: "",
    credit_score: 0,
    date_of_birth: "",
    gender: "",
    annual_income: 0,
    profile_picture: "",
    verification_status: "",
    address: {
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
    },
  },
  referredTeam: [
    {
      team_member_id: "",
      team_member_name: "",
    },
  ],
  referredBy: {
    referrerId: "",
    referrerName: "",
    joining_date: "",
    joining_time: "",
  },
  sessionHistory: [
    {
      date: "",
      start_time: "",
      end_time: "",
      time_spent: "",
    },
  ],
  bankDetails: [
    {
      bank_name: "",
      account_: "",
      ifsc_code: "",
      branch: "",
    },
  ],
  creditCardDetails: [
    {
      card_: "",
      card_type: "",
      expiry_date: "",
      cvv: "",
    },
  ],
  wallet: {
    balance: 100,
    currency_symbol: "",
  },
  rewards: {
    total_rewards: "",
    currency_symbol: "",
  },
  rewardsHistory: [
    {
      reward_id: "",
      reward_name: "",
      reward_amount: "",
      date_earned: "",
    },
  ],
  transactionHistory: [
    {
      toName: "",
      transaction_id: "",
      transaction_amount: "",
      transaction_date: "",
      transaction_time: "",
      transaction_type: "",
      toNumber: "",
      description: "",
    },
  ],
  aadharData: {},
  userSettings: {
    language_preference: "",
  },
  contacts: [],
  triggerMessageTo: ["ADMIN", "SUPERADMIN"],
};
