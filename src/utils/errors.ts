export const RECORD_NOT_FOUND_CODE = "P2025";
export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
export class NotFound extends AppError {
  constructor(message: string = "NotFound", statusCode: number = 404) {
    super(message, statusCode);
    this.statusCode = statusCode;
  }
}

export class UserNotFound extends NotFound {
  constructor() {
    super();
  }
}

export class DuplicateUsernameError extends AppError {
  constructor(
    message: string = "DuplicateUsernameError",
    statusCode: number = 409
  ) {
    super(message, statusCode);
    this.statusCode = statusCode;
  }
}

export class InvalidCredentials extends AppError {
  statusCode: number;
  body: any;
  constructor(
    message: string = "InvalidCredentials",
    statusCode: number = 401
  ) {
    super(message, statusCode);
    this.statusCode = statusCode;
  }
}

export class InsufficientFunds extends AppError {
  statusCode: number;
  body: any;
  constructor(message: string = "InsufficientFunds", statusCode: number = 400) {
    super(message, statusCode);
    this.statusCode = statusCode;
  }
}
// {
//     "statusCode": 500,
//     "error": "Internal Server Error",
//     "message": "UserNotFound"
// }
