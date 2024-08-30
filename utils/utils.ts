function parseInteger(value: string): number | null {
  // Try to convert a string to int
  const number = parseInt(value, 10);

  // Checks if the conversion was successful
  if (!isNaN(number) && isFinite(number)) {
    return number;
  } else {
    return null;
  }
}

exports.parseInteger = parseInteger;
