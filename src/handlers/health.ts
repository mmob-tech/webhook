import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import { SUPPORTED_GITHUB_EVENTS } from "../types/webhook";
import { checkSystemHealth, generateHealthCheckData } from "../utils/health";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../utils/response-builder";

export const healthCheck = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback
) => {
  console.log(`🏥 Health check requested`);
  console.log(`Path: ${event.path}`);
  console.log(`Method: ${event.httpMethod}`);

  try {
    // Generate comprehensive health data
    const healthData = generateHealthCheckData(context);

    // Perform system health checks
    const systemHealth = await checkSystemHealth();

    // Combine health information
    const completeHealthData = {
      ...healthData,
      system_health: systemHealth,
      supported_events: {
        count: SUPPORTED_GITHUB_EVENTS.length,
        events: SUPPORTED_GITHUB_EVENTS,
      },
      service_info: {
        service_name: "GitHub Webhook Handler",
        description: "AWS Lambda function for processing GitHub webhooks",
        version: process.env.APP_VERSION || "1.0.0",
        deployment_stage: process.env.STAGE || "dev",
      },
    };

    // Determine overall health status
    const isHealthy = systemHealth.healthy && healthData.status === "healthy";
    const statusCode = isHealthy ? 200 : 503;

    if (!isHealthy) {
      console.error(`🚨 Health check failed:`);
      console.error(`System issues: ${systemHealth.issues.join(", ")}`);

      return callback(
        null,
        buildErrorResponse(
          statusCode,
          "Service is unhealthy",
          completeHealthData
        )
      );
    }

    console.log(`✅ Health check passed`);
    return callback(
      null,
      buildSuccessResponse("Service is healthy", completeHealthData, statusCode)
    );
  } catch (error) {
    console.error(`💥 Health check error:`, error);

    return callback(
      null,
      buildErrorResponse(500, "Health check failed with error", {
        error_message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        request_id: context.awsRequestId,
      })
    );
  }
};

/**
 * Simple ping endpoint for basic connectivity testing
 */
export const pingCheck = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback
) => {
  console.log(`🏓 Ping check requested`);

  return callback(
    null,
    buildSuccessResponse("pong", {
      request_id: context.awsRequestId,
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || "1.0.0",
    })
  );
};
