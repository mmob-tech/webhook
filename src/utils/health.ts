import { Context } from "aws-lambda";

export interface HealthCheckData {
  status: "healthy" | "unhealthy";
  timestamp: string;
  service: string;
  version: string;
  environment: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  secretConfigured: boolean;
  context?: {
    functionName: string;
    functionVersion: string;
    memoryLimit: string;
    remainingTime: number;
  };
}

export const generateHealthCheckData = (context?: Context): HealthCheckData => {
  const healthData: HealthCheckData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "github-webhook-handler",
    version: process.env.SERVICE_VERSION || "1.0.0",
    environment: process.env.NODE_ENV || "production",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    secretConfigured: !!process.env.GITHUB_WEBHOOK_SECRET,
  };

  if (context) {
    healthData.context = {
      functionName: context.functionName,
      functionVersion: context.functionVersion,
      memoryLimit: context.memoryLimitInMB,
      remainingTime: context.getRemainingTimeInMillis(),
    };
  }

  return healthData;
};
