import { APIGatewayEvent, Context, Callback } from 'aws-lambda';
import { validateWebhookPayload } from './utils/validator';
import { WebhookPayload } from './types/github';

export const webhookHandler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
    try {
        const payload: WebhookPayload = JSON.parse(event.body || '{}');

        // Validate the incoming payload
        const isValid = validateWebhookPayload(payload);
        if (!isValid) {
            return callback(null, {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid payload' }),
            });
        }

        // Process the event based on its type
        switch (payload.action) {
            case 'created':
                // Handle created event
                break;
            case 'updated':
                // Handle updated event
                break;
            // Add more cases as needed for different event types
            default:
                return callback(null, {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'Unsupported event type' }),
                });
        }

        return callback(null, {
            statusCode: 200,
            body: JSON.stringify({ message: 'Event processed successfully' }),
        });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return callback(null, {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        });
    }
};