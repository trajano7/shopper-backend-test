class CustomError extends Error {
  public error_status: number;
  public error_code: string;
  public error_description: string;

  constructor(
    error_status: number,
    error_code: string,
    error_description: string
  ) {
    super(error_description);
    this.error_status = error_status;
    this.error_code = error_code;
    this.error_description = error_description;

    Object.setPrototypeOf(this, CustomError.prototype);
  }

  public toJSON() {
    return {
      error_code: this.error_code,
      error_description: this.error_description,
    };
  }
}

exports.CustomError = CustomError;
