import * as crypto from "crypto";

export const verifyGitHubWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  if (!payload || !signature || !secret) {
    return false;
  }

  try {
    // Remove 'sha256=' prefix if present
    const cleanSignature = signature.startsWith("sha256=")
      ? signature.substring(7)
      : signature;

    // Create expected signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload, "utf8")
      .digest("hex");

    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(cleanSignature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    console.error("Error verifying GitHub webhook signature:", error);
    return false;
  }
};

export const generateWebhookSignature = (
  payload: string,
  secret: string
): string => {
  return `sha256=${crypto
    .createHmac("sha256", secret)
    .update(payload, "utf8")
    .digest("hex")}`;
};
