import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import { webhookHandler } from "./handler";
import { validateWebhookPayload } from "./utils/validator";

// Mock the validator
jest.mock("./utils/validator", () => ({
  validateWebhookPayload: jest.fn(),
}));

describe("webhookHandler", () => {
  let mockEvent: APIGatewayEvent;
  let mockContext: Context;
  let mockCallback: Callback;

  beforeEach(() => {
    mockEvent = {
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: "POST",
      isBase64Encoded: false,
      path: "/webhook",
      pathParameters: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: "",
    };

    mockContext = {
      callbackWaitsForEmptyEventLoop: false,
      functionName: "webhookHandler",
      functionVersion: "1",
      invokedFunctionArn:
        "arn:aws:lambda:eu-west-2:123456789012:function:webhookHandler",
      memoryLimitInMB: "128",
      awsRequestId: "test-request-id",
      logGroupName: "/aws/lambda/webhookHandler",
      logStreamName: "test-stream",
      getRemainingTimeInMillis: () => 30000,
      done: jest.fn(),
      fail: jest.fn(),
      succeed: jest.fn(),
    };

    mockCallback = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe("Valid GitHub audit log payload", () => {
    it("should process valid audit log events successfully", async () => {
      const validPayload = {
        action: "audit_log_streaming",
        audit_log_events: [
          {
            action: "repo.create",
            actor: {
              login: "octocat",
              id: 1,
            },
            created_at: "2025-07-15T10:00:00Z",
            resource: "my-new-repo",
            resource_id: 123456,
            resource_type: "repository",
          },
        ],
        organization: {
          login: "my-org",
          id: 789,
        },
        sender: {
          login: "octocat",
          id: 1,
        },
      };

      mockEvent.body = JSON.stringify(validPayload);
      (validateWebhookPayload as jest.Mock).mockReturnValue(true);

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(validateWebhookPayload).toHaveBeenCalledWith(validPayload);
      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Audit log events processed successfully",
          processed_events: 1,
        }),
      });
    });

    it("should process multiple audit log events", async () => {
      const multipleEventsPayload = {
        action: "audit_log_streaming",
        audit_log_events: [
          {
            action: "repo.create",
            actor: { login: "octocat", id: 1 },
            created_at: "2025-07-15T10:00:00Z",
            resource: "repo1",
            resource_id: 123456,
            resource_type: "repository",
          },
          {
            action: "repo.destroy",
            actor: { login: "octocat", id: 1 },
            created_at: "2025-07-15T10:01:00Z",
            resource: "repo2",
            resource_id: 123457,
            resource_type: "repository",
          },
        ],
        organization: { login: "my-org", id: 789 },
        sender: { login: "octocat", id: 1 },
      };

      mockEvent.body = JSON.stringify(multipleEventsPayload);
      (validateWebhookPayload as jest.Mock).mockReturnValue(true);

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Audit log events processed successfully",
          processed_events: 2,
        }),
      });
    });
  });

  describe("Invalid payloads", () => {
    it("should return 400 for invalid payload", async () => {
      const invalidPayload = {
        action: "invalid_action",
        data: "test",
      };

      mockEvent.body = JSON.stringify(invalidPayload);
      (validateWebhookPayload as jest.Mock).mockReturnValue(false);

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid audit log payload" }),
      });
    });

    it("should handle malformed JSON", async () => {
      mockEvent.body = "invalid json";

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 500,
        body: JSON.stringify({ message: "Internal server error" }),
      });
    });

    it("should handle null body", async () => {
      mockEvent.body = null;
      (validateWebhookPayload as jest.Mock).mockReturnValue(false);

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid audit log payload" }),
      });
    });
  });

  describe("Error handling", () => {
    it("should handle validator throwing an error", async () => {
      mockEvent.body = JSON.stringify({ action: "audit_log_streaming" });
      (validateWebhookPayload as jest.Mock).mockImplementation(() => {
        throw new Error("Validation error");
      });

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 500,
        body: JSON.stringify({ message: "Internal server error" }),
      });
    });
  });
});
