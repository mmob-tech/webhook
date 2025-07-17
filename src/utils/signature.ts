import * as crypto from "crypto";

export const verifyGitHubSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  try {
    // GitHub sends signature as "sha256=<hash>"
    const expectedSignature = `sha256=${crypto
      .createHmac("sha256", secret)
      .update(payload, "utf8")
      .digest("hex")}`;

    // Use timingSafeEqual to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("Error verifying signature:", error);
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
