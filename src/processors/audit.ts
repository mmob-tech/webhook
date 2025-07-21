import { AuditLogEvent, GitHubAuditLogWebhookPayload } from "../types/webhook";

export const processAuditLogEvent = async (
  payload: GitHubAuditLogWebhookPayload
): Promise<void> => {
  console.log(`🔍 Processing audit log streaming event`);
  console.log(`Organization: ${payload.organization.login}`);
  console.log(`Events count: ${payload.events?.length || 0}`);

  if (!payload.events || payload.events.length === 0) {
    console.log(`⚠️ No audit events in payload`);
    return;
  }

  // Group events by action for analysis
  const eventsByAction = payload.events.reduce((acc, event) => {
    if (!acc[event.action]) {
      acc[event.action] = [];
    }
    acc[event.action].push(event);
    return acc;
  }, {} as Record<string, AuditLogEvent[]>);

  console.log(`📊 Event summary:`);
  Object.entries(eventsByAction).forEach(([action, events]) => {
    console.log(`  - ${action}: ${events.length} events`);
  });

  // Process each event
  payload.events.forEach((event, index) => {
    console.log(`\n🔍 Event ${index + 1}/${payload.events.length}:`);
    processIndividualAuditEvent(event);
  });

  // Time range analysis
  const timestamps = payload.events.map((e) => e["@timestamp"]);
  const earliest = new Date(Math.min(...timestamps));
  const latest = new Date(Math.max(...timestamps));

  console.log(
    `⏰ Time range: ${earliest.toISOString()} to ${latest.toISOString()}`
  );
  console.log(
    `Duration: ${Math.round(
      (latest.getTime() - earliest.getTime()) / 1000
    )} seconds`
  );
};

const processIndividualAuditEvent = (event: AuditLogEvent): void => {
  console.log(`Action: ${event.action}`);
  console.log(`Timestamp: ${new Date(event["@timestamp"]).toISOString()}`);
  console.log(`Active: ${event.active}`);

  if (event.actor) {
    console.log(`Actor: ${event.actor.login} (ID: ${event.actor.id})`);
    if (event.actor.type) {
      console.log(`Actor type: ${event.actor.type}`);
    }
  }

  if (event.actor_location?.country_code) {
    console.log(`Location: ${event.actor_location.country_code}`);
  }

  if (event.org) {
    console.log(`Organization: ${event.org}`);
  }

  if (event.repo) {
    console.log(`Repository: ${event.repo}`);
  }

  if (event.user) {
    console.log(`User: ${event.user}`);
  }

  if (event.team) {
    console.log(`Team: ${event.team}`);
  }

  if (event.permission) {
    console.log(`Permission: ${event.permission}`);
  }

  if (event.visibility) {
    console.log(`Visibility: ${event.visibility}`);
  }

  if (event.name) {
    console.log(`Name: ${event.name}`);
  }

  if (event.privacy) {
    console.log(`Privacy: ${event.privacy}`);
  }

  if (event.old_user) {
    console.log(`Old user: ${event.old_user}`);
  }

  if (event.oauth_application_name) {
    console.log(`OAuth app: ${event.oauth_application_name}`);
  }

  if (event.integration_name) {
    console.log(`Integration: ${event.integration_name}`);
  }

  if (event.programmatic_access_type) {
    console.log(`Access type: ${event.programmatic_access_type}`);
  }

  if (event.secret_type) {
    console.log(`Secret type: ${event.secret_type}`);
  }

  if (event.config) {
    console.log(`Config: ${JSON.stringify(event.config)}`);
  }

  if (event.events && event.events.length > 0) {
    console.log(`Events: ${event.events.join(", ")}`);
  }

  if (event.data && Object.keys(event.data).length > 0) {
    console.log(`Additional data: ${JSON.stringify(event.data)}`);
  }
};
