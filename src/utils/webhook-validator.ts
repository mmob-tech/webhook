import { APIGatewayEvent } from "aws-lambda";
import { verifyGitHubSignature } from "../utils/signature";

export interface ValidationResult {
  isValid: boolean;
  statusCode: number;
  message: string;
  details?: string;
}

export const validateWebhookSignature = async (
  event: APIGatewayEvent
): Promise<ValidationResult> => {
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("GITHUB_WEBHOOK_SECRET environment variable is not set");
    return {
      isValid: false,
      statusCode: 500,
      message: "Webhook secret not configured",
      details: "Server configuration error",
    };
  }

  const signature =
    event.headers["X-Hub-Signature-256"] ||
    event.headers["x-hub-signature-256"];

  if (!signature) {
    console.error("Missing X-Hub-Signature-256 header");
    return {
      isValid: false,
      statusCode: 401,
      message: "Missing signature header",
      details: "X-Hub-Signature-256 header is required",
    };
  }

  const body = event.body || "";
  const isValid = verifyGitHubSignature(body, signature, webhookSecret);

  if (!isValid) {
    console.error("Invalid webhook signature");
    return {
      isValid: false,
      statusCode: 401,
      message: "Invalid signature",
      details: "Webhook signature verification failed",
    };
  }

  console.log("✅ Webhook signature validated successfully");
  return {
    isValid: true,
    statusCode: 200,
    message: "Valid signature",
  };
};

export const validateWebhookPayload = (
  event: APIGatewayEvent
): ValidationResult => {
  // Check if body exists
  if (!event.body) {
    return {
      isValid: false,
      statusCode: 400,
      message: "Missing request body",
      details: "Webhook payload is required",
    };
  }

  // Check if body is valid JSON
  try {
    JSON.parse(event.body);
  } catch (error) {
    return {
      isValid: false,
      statusCode: 400,
      message: "Invalid JSON payload",
      details: "Request body must be valid JSON",
    };
  }

  // Check GitHub event header
  const githubEvent =
    event.headers["X-GitHub-Event"] || event.headers["x-github-event"];

  if (!githubEvent) {
    return {
      isValid: false,
      statusCode: 400,
      message: "Missing GitHub event header",
      details: "X-GitHub-Event header is required",
    };
  }

  // Check User-Agent
  const userAgent = event.headers["User-Agent"] || event.headers["user-agent"];

  if (!userAgent || !userAgent.startsWith("GitHub-Hookshot/")) {
    return {
      isValid: false,
      statusCode: 401,
      message: "Invalid User-Agent",
      details: "Request must come from GitHub",
    };
  }

  return {
    isValid: true,
    statusCode: 200,
    message: "Valid payload",
  };
};

export const validateEnvironmentConfig = (): ValidationResult => {
  const requiredEnvVars = ["GITHUB_WEBHOOK_SECRET"];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    return {
      isValid: false,
      statusCode: 500,
      message: "Missing environment variables",
      details: `Required variables: ${missingVars.join(", ")}`,
    };
  }

  return {
    isValid: true,
    statusCode: 200,
    message: "Environment configuration valid",
  };
};
