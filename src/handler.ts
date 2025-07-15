import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import { AuditLogEvent, GitHubAuditLogWebhookPayload } from "./types/webhook";
import { validateWebhookPayload } from "./utils/validator";

export const webhookHandler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback
) => {
  try {
    const payload: GitHubAuditLogWebhookPayload = JSON.parse(
      event.body || "{}"
    );

    // Validate the incoming payload
    const isValid = validateWebhookPayload(payload);
    if (!isValid) {
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid audit log payload" }),
      });
    }

    // Process each audit log event
    for (const auditEvent of payload.audit_log_events) {
      await processAuditLogEvent(auditEvent, payload.organization);
    }

    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        message: "Audit log events processed successfully",
        processed_events: payload.audit_log_events.length,
      }),
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return callback(null, {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    });
  }
};

const processAuditLogEvent = async (
  event: AuditLogEvent,
  organization: any
): Promise<void> => {
  console.log(
    `Processing audit event: ${event.action} by ${event.actor.login}`
  );

  // Handle different audit log event types
  switch (event.action) {
    case "repo.create":
      console.log(`Repository created: ${event.resource}`);
      break;
    case "repo.destroy":
      console.log(`Repository deleted: ${event.resource}`);
      break;
    case "team.create":
      console.log(`Team created: ${event.resource}`);
      break;
    case "org.invite_member":
      console.log(`Member invited to org: ${event.resource}`);
      break;
    // Add more cases for different audit log actions
    default:
      console.log(`Unhandled audit event: ${event.action}`);
  }
};
