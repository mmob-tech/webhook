import { Callback } from "aws-lambda";
import { processAuditLogEvent } from "../processors";
import { GitHubAuditLogWebhookPayload, WebhookPayload } from "../types/webhook";
import { buildSuccessResponse } from "../utils/response-builder";

export const handleSecurityEvents = async (
  eventType: string,
  payload: WebhookPayload,
  callback: Callback
) => {
  console.log(`🔒 Handling security event: ${eventType}`);

  switch (eventType) {
    case "audit_log_streaming":
      return await handleAuditLogStreamingEvent(
        payload as GitHubAuditLogWebhookPayload,
        callback
      );

    default:
      return callback(
        null,
        buildSuccessResponse(`Unhandled security event: ${eventType}`)
      );
  }
};

const handleAuditLogStreamingEvent = async (
  payload: GitHubAuditLogWebhookPayload,
  callback: Callback
) => {
  console.log(`🔍 Audit log streaming: ${payload.events?.length || 0} events`);
  await processAuditLogEvent(payload);

  // Group events by action type for summary
  const eventSummary =
    payload.events?.reduce((acc, event) => {
      acc[event.action] = (acc[event.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

  return callback(
    null,
    buildSuccessResponse("Audit log streaming event processed", {
      organization: payload.organization.login,
      events_count: payload.events?.length || 0,
      event_summary: eventSummary,
      unique_actions: Object.keys(eventSummary).length,
      time_range:
        payload.events && payload.events.length > 0
          ? {
              earliest: new Date(
                Math.min(...payload.events.map((e) => e["@timestamp"]))
              ).toISOString(),
              latest: new Date(
                Math.max(...payload.events.map((e) => e["@timestamp"]))
              ).toISOString(),
            }
          : null,
    })
  );
};
