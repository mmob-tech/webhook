import { AuditLogEvent, GitHubAuditLogWebhookPayload } from "../types/webhook";

export const validateWebhookPayload = (
  payload: GitHubAuditLogWebhookPayload
): boolean => {
  // Basic validation
  if (!payload || typeof payload !== "object") {
    return false;
  }

  // Check if this is an audit log streaming event
  if (payload.action !== "audit_log_streaming") {
    return false;
  }

  // Check if audit_log_events exists and is an array
  if (!Array.isArray(payload.audit_log_events)) {
    return false;
  }

  // Validate each audit log event
  return payload.audit_log_events.every(validateAuditLogEvent);
};

const validateAuditLogEvent = (event: AuditLogEvent): boolean => {
  return !!(
    event.action &&
    event.actor &&
    event.actor.login &&
    event.created_at &&
    event.resource &&
    event.resource_type
  );
};
