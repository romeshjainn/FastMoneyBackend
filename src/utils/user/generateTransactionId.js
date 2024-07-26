export function generateTransactionId(
  uniqueNumber = Math.floor(Math.random() * 10000),
  uniqprefix = "TXN"
) {
  const timestamp = Date.now();
  const randomPart = Math.floor(Math.random() * 100000);
  const uniqueTransactionId = (timestamp % 10000000000) + randomPart;
  const transactionID = uniqueTransactionId.toString().padStart(10, "0");
  return `${uniqprefix}-${transactionID}-${uniqueNumber}`;
}
