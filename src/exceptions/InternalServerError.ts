class InternalServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InternalServerError";
  }
}

export default InternalServerError;
