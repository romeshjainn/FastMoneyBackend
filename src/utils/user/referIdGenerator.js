export const generateReferId = (name, number, type) => {
  let value = "";
  let referId = "";
  const startFrom = 1000;

  if (typeof name === "string" && name.length > 0) {
    value = name.substring(0, 3).toUpperCase();
  } else {
    value = "FMP";
  }

  if (type == "colLength") {
    referId = value + (startFrom + Number(number));
  } else {
    let id = number.substring(0, 4);
    console.log(id, startFrom);
    const num = startFrom + Number(id);
    referId = value + num;
  }
  return referId;
};

console.log(generateReferId("romesh jain", 0, "colLength"));
