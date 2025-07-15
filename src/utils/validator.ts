import { WebhookPayload } from '../types/github';

export function validateWebhookPayload(payload: any): payload is WebhookPayload {
    if (!payload || typeof payload !== 'object') {
        return false;
    }

    const requiredFields = ['action', 'repository', 'sender', 'audit_log'];
    for (const field of requiredFields) {
        if (!(field in payload)) {
            return false;
        }
    }

    // Additional validation logic can be added here
    return true;
}