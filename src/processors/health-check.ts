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
    log_group: string;
    log_stream: string;
  };
  system?: {
    node_version: string;
    platform: string;
    arch: string;
  };
  configuration?: {
    webhook_secret_configured: boolean;
    supported_events: number;
  };
}

export const generateHealthCheckData = (context: Context): HealthCheckData => {
  const memoryUsage = process.memoryUsage();
  const memoryLimit = parseInt(context.memoryLimitInMB) * 1024 * 1024; // Convert MB to bytes

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
      log_group: context.logGroupName,
      log_stream: context.logStreamName,
    },
    system: {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    configuration: {
      webhook_secret_configured: !!process.env.GITHUB_WEBHOOK_SECRET,
      supported_events: 30, // Update this based on your supported events
    },
  };
};

export const checkSystemHealth = async (): Promise<{
  healthy: boolean;
  checks: Record<string, boolean>;
  issues: string[];
}> => {
  const checks: Record<string, boolean> = {};
  const issues: string[] = [];

  // Check environment variables
  checks.webhook_secret = !!process.env.GITHUB_WEBHOOK_SECRET;
  if (!checks.webhook_secret) {
    issues.push("GITHUB_WEBHOOK_SECRET not configured");
  }

  // Check memory usage
  const memoryUsage = process.memoryUsage();
  const memoryThreshold = 0.9; // 90% memory usage threshold
  checks.memory_ok =
    memoryUsage.heapUsed / memoryUsage.heapTotal < memoryThreshold;
  if (!checks.memory_ok) {
    issues.push(
      `High memory usage: ${Math.round(
        (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
      )}%`
    );
  }

  // Check if required modules are available
  try {
    require("crypto");
    checks.crypto_available = true;
  } catch {
    checks.crypto_available = false;
    issues.push("Crypto module not available");
  }

  const healthy = Object.values(checks).every(Boolean);

  return {
    healthy,
    checks,
    issues,
  };
};
