import { Context } from "aws-lambda";

export interface HealthCheckData {
  status: "healthy" | "unhealthy";
  timestamp: string;
  version?: string;
  environment?: string;
  uptime?: number;
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
  lambda?: {
    function_name: string;
    function_version: string;
    remaining_time: number;
    request_id: string;
  };
  configuration?: {
    webhook_secret_configured: boolean;
    supported_events: number;
  };
}

export const generateHealthCheckData = (context: Context): HealthCheckData => {
  const memoryUsage = process.memoryUsage();
  const memoryLimit = parseInt(context.memoryLimitInMB) * 1024 * 1024;

  return {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || "unknown",
    environment: process.env.NODE_ENV || "unknown",
    uptime: process.uptime(),
    memory: {
      used: memoryUsage.heapUsed,
      total: memoryLimit,
      percentage: Math.round((memoryUsage.heapUsed / memoryLimit) * 100),
    },
    lambda: {
      function_name: context.functionName,
      function_version: context.functionVersion,
      remaining_time: context.getRemainingTimeInMillis(),
      request_id: context.awsRequestId,
    },
    configuration: {
      webhook_secret_configured: !!process.env.GITHUB_WEBHOOK_SECRET,
      supported_events: 30,
    },
  };
};
