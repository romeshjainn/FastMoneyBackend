export function validateTransactionData(data) {
  const requiredFields = [
    "to",
    "transaction_amount",
    "transaction_date",
    "transaction_type",
    "description",
  ];
  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== "string") {
      return false;
    }
  }
  return true;
}
