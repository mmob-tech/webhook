// Create new file: src/utils/logger.ts
export const logWebhookEvent = (eventType: string, payload: any) => {
  console.log(`=== GitHub Webhook Event: ${eventType} ===`);
  console.log("Event Type:", eventType);
  console.log("Timestamp:", new Date().toISOString());

  // Log key details first
  if (payload.action) {
    console.log("Action:", payload.action);
  }

  if (payload.repository) {
    console.log("Repository:", payload.repository.full_name);
  }

  if (payload.sender) {
    console.log("Sender:", payload.sender.login);
  }

  // Log full payload
  console.log("Full Payload:", JSON.stringify(payload, null, 2));
  console.log("=".repeat(50));
};

export const logPayloadSection = (section: string, data: any) => {
  console.log(`--- ${section} ---`);
  console.log(JSON.stringify(data, null, 2));
};
