export interface AuditLogEvent {
  action: string;
  actor: {
    login: string;
    id: number;
  };
  created_at: string;
  resource: string;
  resource_id: number;
  resource_type: string;
  // Additional fields that GitHub audit log events may include
  organization?: {
    login: string;
    id: number;
  };
  repository?: {
    name: string;
    id: number;
    full_name: string;
  };
  data?: {
    [key: string]: any;
  };
}

export interface GitHubAuditLogWebhookPayload {
  action: "audit_log_streaming";
  audit_log_events: AuditLogEvent[];
  organization: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
  installation?: {
    id: number;
  };
}

// Keep the generic payload for backwards compatibility
export interface WebhookPayload extends GitHubAuditLogWebhookPayload {}
