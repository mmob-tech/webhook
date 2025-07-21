interface ResponseData {
  [key: string]: any;
}

interface APIGatewayResponse {
  statusCode: number;
  headers?: { [key: string]: string };
  body: string;
}

export const buildSuccessResponse = (
  message: string,
  data?: ResponseData,
  statusCode: number = 200
): APIGatewayResponse => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Hub-Signature-256",
  },
  body: JSON.stringify({
    success: true,
    message,
    timestamp: new Date().toISOString(),
    ...data,
  }),
});

export const buildErrorResponse = (
  statusCode: number,
  message: string,
  data?: ResponseData
): APIGatewayResponse => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  body: JSON.stringify({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    ...data,
  }),
});
