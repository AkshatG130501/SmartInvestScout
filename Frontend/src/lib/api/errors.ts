/**
 * @file Error handling utilities for API requests
 * @description Provides type-safe error handling for Axios requests
 */

export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return !!obj && typeof obj === "object" && key in obj;
}

/**
 * Checks if an error is a 404 Not Found error
 * @param error Any error object
 * @returns Whether the error is a 404 Not Found error
 */
export function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const isAxiosError =
    hasProperty(error, "isAxiosError") && error.isAxiosError === true;

  if (isAxiosError && hasProperty(error, "response")) {
    const response = error.response;

    if (
      response &&
      typeof response === "object" &&
      hasProperty(response, "status")
    ) {
      return response.status === 404;
    }
  }

  return false;
}

/**
 * Formats an error message for logging or display
 * @param error Any error object
 * @returns A formatted error message
 */
export function formatErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return String(error);
  }

  if (hasProperty(error, "isAxiosError") && error.isAxiosError === true) {
    if (
      hasProperty(error, "response") &&
      error.response &&
      typeof error.response === "object"
    ) {
      const response = error.response;

      if (
        hasProperty(response, "data") &&
        response.data &&
        typeof response.data === "object" &&
        hasProperty(response.data, "message") &&
        typeof response.data.message === "string"
      ) {
        return response.data.message;
      }
    }

    if (hasProperty(error, "message") && typeof error.message === "string") {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
