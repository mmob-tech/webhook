import { createHmac, timingSafeEqual } from "crypto";

export const verifyGitHubSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  try {
    if (!signature.startsWith("sha256=")) {
      console.error("Invalid signature format - must start with 'sha256='");
      return false;
    }

    const githubSignature = signature.slice(7);
    const hmac = createHmac("sha256", secret);
    hmac.update(payload, "utf8");
    const expectedSignature = hmac.digest("hex");

    if (githubSignature.length !== expectedSignature.length) {
      return false;
    }

    const githubBuffer = Buffer.from(githubSignature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    return timingSafeEqual(githubBuffer, expectedBuffer);
  } catch (error) {
    console.error("Error verifying GitHub signature:", error);
    return false;
  }
};

export const generateGitHubSignature = (
  payload: string,
  secret: string
): string => {
  const hmac = createHmac("sha256", secret);
  hmac.update(payload, "utf8");
  return `sha256=${hmac.digest("hex")}`;
};
