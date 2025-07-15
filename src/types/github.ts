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
}

export interface WebhookPayload {
    action: string;
    audit_log_events: AuditLogEvent[];
}