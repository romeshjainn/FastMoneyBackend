export const userIdGenerator = (number) => {
  const charMap = "abcdefghij";

  const numberStr = number.toString();
  let result = "";

  for (let i = 0; i < numberStr.length; i++) {
    const digit = parseInt(numberStr[i], 10);
    result += charMap[digit];
  }

  return result.toUpperCase() + number;
};
console.log(userIdGenerator("6260162210"));
