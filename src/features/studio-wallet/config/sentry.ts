export const initSentry = () => undefined;

export class WalletError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public additionalData?: unknown
  ) {
    super(message);
    this.name = "WalletError";
  }
}

export class NetworkError extends WalletError {
  constructor(message: string, statusCode: number, response?: unknown) {
    super(message, "NETWORK_ERROR", statusCode, response);
    this.name = "NetworkError";
  }
}

export class ValidationError extends WalletError {
  constructor(message: string, public field?: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends WalletError {
  constructor(message: string) {
    super(message, "AUTHENTICATION_ERROR", 401);
    this.name = "AuthenticationError";
  }
}

export const trackWalletError = (error: Error, context?: unknown) => {
  console.error("Wallet error:", error, context);
};

export const trackWalletPerformance = () => undefined;

export const trackWalletInteraction = () => undefined;

export const trackApiRequest = () => undefined;

export const recoverFromError = (error: Error, fallbackValue?: unknown) => {
  if (fallbackValue !== undefined) {
    return fallbackValue;
  }

  throw error;
};

export const globalErrorHandler = (error: Error) => {
  console.error("Wallet error:", error);
};
