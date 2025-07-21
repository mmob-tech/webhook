import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import { buildErrorResponse } from "./response-builder";

export interface ErrorContext {
  requestId: string;
  functionName: string;
  eventType?: string;
  userAgent?: string;
}

export const handleError = (
  error: any,
  event: APIGatewayEvent,
  context: Context,
  callback: Callback
) => {
  const errorMessage = error?.message || "Unknown error occurred";
  const errorStack = error?.stack || "No stack trace available";
  const errorName = error?.name || "Error";

  const errorContext: ErrorContext = {
    requestId: context.awsRequestId,
    functionName: context.functionName,
    eventType:
      event.headers["X-GitHub-Event"] || event.headers["x-github-event"],
    userAgent: event.headers["User-Agent"] || event.headers["user-agent"],
  };

  console.error("🚨 Webhook processing error occurred:");
  console.error(`Error Name: ${errorName}`);
  console.error(`Error Message: ${errorMessage}`);
  console.error(`Error Stack: ${errorStack}`);
  console.error("Request Context:", JSON.stringify(errorContext, null, 2));

  let statusCode = 500;
  let publicMessage = "Internal server error processing webhook";

  if (error?.name === "ValidationError" || error?.statusCode === 400) {
    statusCode = 400;
    publicMessage = "Bad request - invalid webhook payload";
  } else if (error?.name === "UnauthorizedError" || error?.statusCode === 401) {
    statusCode = 401;
    publicMessage = "Unauthorized - invalid webhook signature";
  }

  const errorResponse = buildErrorResponse(statusCode, publicMessage, {
    error_id: context.awsRequestId,
    error_type: errorName,
    timestamp: new Date().toISOString(),
  });

  return callback(null, errorResponse);
};
