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
    let id = Number(number.substring(0, 4));
    const num = startFrom + id;
    referId = value + num;
  }
  return referId;
};
