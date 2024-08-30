function isValidString(text: string, minLength: number = 1): boolean {
  return typeof text === "string" && text.trim().length >= minLength;
}

function isNonNegativeInteger(value: any): boolean {
  return Number.isInteger(value) && value >= 0;
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

function isValidBase64(img: string): boolean {
  if (!isValidString(img)) {
    return false;
  }

  const base64String = img.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

  try {
    return btoa(atob(base64String)) === base64String;
  } catch (err) {
    return false;
  }
}

function isValidMeasureType(measureType: string): boolean {
  if (!isValidString(measureType)) {
    return false;
  }

  return ["water", "gas"].includes(measureType.toLowerCase());
}

function checkUploadParams(
  customerCode: string,
  image: string,
  measureDate: string,
  measureType: string
): string[] {
  let errors: string[] = [];

  if (!isValidString(customerCode)) {
    errors.push("customer_code");
  }

  if (!isValidBase64(image)) {
    errors.push("image");
  }

  if (!isValidDate(measureDate)) {
    errors.push("measure_datetime");
  }

  if (!isValidMeasureType(measureType)) {
    errors.push("measure_type");
  }

  return errors;
}

function checkConfirmParams(
  measureID: string,
  confirmedValue: number
): string[] {
  let errors: string[] = [];

  if (!isValidString(measureID)) {
    errors.push("measure_uuid");
  }

  if (!isNonNegativeInteger(confirmedValue)) {
    errors.push("confirmed_value");
  }

  return errors;
}

exports.checkUploadParams = checkUploadParams;
exports.checkConfirmParams = checkConfirmParams;
exports.isValidMeasureType = isValidMeasureType;
