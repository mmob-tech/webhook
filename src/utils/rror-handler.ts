import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import { buildErrorResponse } from "./response-builder";

export interface ErrorContext {
  requestId: string;
  functionName: string;
  eventType?: string;
  userAgent?: string;
  sourceIp?: string;
  contentType?: string;
  contentLength?: string;
}

export const handleError = (
  error: any,
  event: APIGatewayEvent,
  context: Context,
  callback: Callback
) => {
  // Extract error information
  const errorMessage = error?.message || "Unknown error occurred";
  const errorStack = error?.stack || "No stack trace available";
  const errorName = error?.name || "Error";

  // Build error context
  const errorContext: ErrorContext = {
    requestId: context.awsRequestId,
    functionName: context.functionName,
    eventType:
      event.headers["X-GitHub-Event"] || event.headers["x-github-event"],
    userAgent: event.headers["User-Agent"] || event.headers["user-agent"],
    sourceIp:
      event.headers["X-Forwarded-For"] || event.headers["x-forwarded-for"],
    contentType: event.headers["Content-Type"] || event.headers["content-type"],
    contentLength:
      event.headers["Content-Length"] || event.headers["content-length"],
  };

  // Log comprehensive error information
  console.error("🚨 Webhook processing error occurred:");
  console.error(`Error Name: ${errorName}`);
  console.error(`Error Message: ${errorMessage}`);
  console.error(`Error Stack: ${errorStack}`);
  console.error("Request Context:", JSON.stringify(errorContext, null, 2));

  // Log request details for debugging
  console.error("Request Details:", {
    method: event.httpMethod,
    path: event.path,
    queryStringParameters: event.queryStringParameters,
    pathParameters: event.pathParameters,
    headers: Object.keys(event.headers || {}).reduce((acc, key) => {
      // Don't log sensitive headers
      if (
        key.toLowerCase().includes("authorization") ||
        key.toLowerCase().includes("signature")
      ) {
        acc[key] = "[REDACTED]";
      } else {
        acc[key] = event.headers[key];
      }
      return acc;
    }, {} as { [key: string]: string | undefined }),
  });

  // Determine error type and status code
  let statusCode = 500;
  let publicMessage = "Internal server error processing webhook";

  if (error?.name === "ValidationError" || error?.statusCode === 400) {
    statusCode = 400;
    publicMessage = "Bad request - invalid webhook payload";
  } else if (error?.name === "UnauthorizedError" || error?.statusCode === 401) {
    statusCode = 401;
    publicMessage = "Unauthorized - invalid webhook signature";
  } else if (error?.name === "ForbiddenError" || error?.statusCode === 403) {
    statusCode = 403;
    publicMessage = "Forbidden - access denied";
  } else if (error?.name === "NotFoundError" || error?.statusCode === 404) {
    statusCode = 404;
    publicMessage = "Not found - invalid endpoint";
  } else if (error?.name === "TimeoutError" || error?.statusCode === 408) {
    statusCode = 408;
    publicMessage = "Request timeout";
  } else if (error?.statusCode >= 400 && error?.statusCode < 500) {
    statusCode = error.statusCode;
    publicMessage = `Client error: ${errorMessage}`;
  }

  // Build error response
  const errorResponse = buildErrorResponse(statusCode, publicMessage, {
    error_id: context.awsRequestId,
    error_type: errorName,
    timestamp: new Date().toISOString(),
    // Only include error details in development
    ...(process.env.NODE_ENV === "development" && {
      error_details: errorMessage,
      error_context: errorContext,
    }),
  });

  // Send error response
  return callback(null, errorResponse);
};

export const logWarning = (
  message: string,
  context?: any,
  event?: APIGatewayEvent
) => {
  console.warn("⚠️ Warning:", message);
  if (context) {
    console.warn("Context:", JSON.stringify(context, null, 2));
  }
  if (event) {
    console.warn(
      "Event Type:",
      event.headers["X-GitHub-Event"] ||
        event.headers["x-github-event"] ||
        "Unknown"
    );
  }
};

export const logInfo = (message: string, data?: any) => {
  console.log("ℹ️", message);
  if (data) {
    console.log("Data:", JSON.stringify(data, null, 2));
  }
};

export const createCustomError = (
  message: string,
  statusCode: number = 500,
  name: string = "CustomError"
): Error & { statusCode: number } => {
  const error = new Error(message) as Error & { statusCode: number };
  error.name = name;
  error.statusCode = statusCode;
  return error;
};
