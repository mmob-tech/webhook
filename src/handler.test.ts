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

  describe("Ping event", () => {
    it("should handle ping event successfully", async () => {
      const pingPayload = {
        zen: "Non-blocking is better than blocking.",
        hook_id: 123456,
        hook: {
          type: "Organization",
          id: 123456,
          name: "web",
          active: true,
          events: ["audit_log_streaming"],
          config: {
            content_type: "json",
            insecure_ssl: "0",
            url: "https://example.com/webhook",
          },
          updated_at: "2025-07-15T10:00:00Z",
          created_at: "2025-07-15T10:00:00Z",
          url: "https://api.github.com/repos/test/test/hooks/123456",
          test_url: "https://api.github.com/repos/test/test/hooks/123456/test",
          ping_url: "https://api.github.com/repos/test/test/hooks/123456/pings",
          deliveries_url:
            "https://api.github.com/repos/test/test/hooks/123456/deliveries",
          last_response: {
            code: 200,
            status: "active",
            message: "OK",
          },
        },
        organization: {
          login: "my-org",
          id: 789,
        },
        sender: {
          login: "octocat",
          id: 1,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "ping";
      mockEvent.body = JSON.stringify(pingPayload);

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Ping received successfully",
          zen: pingPayload.zen,
          hook_id: pingPayload.hook_id,
        }),
      });
    });
  });

  describe("Repository events", () => {
    it("should handle repository created event", async () => {
      const repoPayload = {
        action: "created",
        repository: {
          id: 123456,
          name: "test-repo",
          full_name: "my-org/test-repo",
          private: false,
          owner: {
            login: "my-org",
            id: 789,
          },
          description: "Test repository",
          created_at: "2025-07-15T10:00:00Z",
          updated_at: "2025-07-15T10:00:00Z",
        },
        organization: {
          login: "my-org",
          id: 789,
        },
        sender: {
          login: "octocat",
          id: 1,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "repository";
      mockEvent.body = JSON.stringify(repoPayload);

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Repository created event processed",
          repository: repoPayload.repository.full_name,
          action: repoPayload.action,
        }),
      });
    });

    it("should handle repository deleted event", async () => {
      const repoPayload = {
        action: "deleted",
        repository: {
          id: 123456,
          name: "test-repo",
          full_name: "my-org/test-repo",
          private: false,
          owner: {
            login: "my-org",
            id: 789,
          },
          description: "Test repository",
          created_at: "2025-07-15T10:00:00Z",
          updated_at: "2025-07-15T10:00:00Z",
        },
        organization: {
          login: "my-org",
          id: 789,
        },
        sender: {
          login: "octocat",
          id: 1,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "repository";
      mockEvent.body = JSON.stringify(repoPayload);

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Repository deleted event processed",
          repository: repoPayload.repository.full_name,
          action: repoPayload.action,
        }),
      });
    });
  });

  describe("Push events", () => {
    it("should handle push event", async () => {
      const pushPayload = {
        ref: "refs/heads/main",
        before: "abc123",
        after: "def456",
        created: false,
        deleted: false,
        forced: false,
        commits: [
          {
            id: "def456",
            message: "Test commit",
            author: {
              name: "Test Author",
              email: "test@example.com",
            },
            committer: {
              name: "Test Author",
              email: "test@example.com",
            },
            url: "https://github.com/my-org/test-repo/commit/def456",
            timestamp: "2025-07-15T10:00:00Z",
          },
        ],
        repository: {
          id: 123456,
          name: "test-repo",
          full_name: "my-org/test-repo",
          owner: {
            login: "my-org",
            id: 789,
          },
        },
        pusher: {
          name: "octocat",
          email: "octocat@github.com",
        },
        sender: {
          login: "octocat",
          id: 1,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "push";
      mockEvent.body = JSON.stringify(pushPayload);

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Push event processed",
          repository: pushPayload.repository.full_name,
          ref: pushPayload.ref,
          commits: pushPayload.commits.length,
        }),
      });
    });
  });

  describe("Pull Request events", () => {
    it("should handle pull request opened event", async () => {
      const prPayload = {
        action: "opened",
        number: 123,
        pull_request: {
          id: 789,
          number: 123,
          title: "Test PR",
          body: "Test PR description",
          state: "open" as const,
          merged: false,
          head: {
            ref: "feature-branch",
            sha: "abc123",
            repo: {
              id: 123456,
              name: "test-repo",
              full_name: "my-org/test-repo",
            },
          },
          base: {
            ref: "main",
            sha: "def456",
            repo: {
              id: 123456,
              name: "test-repo",
              full_name: "my-org/test-repo",
            },
          },
          user: {
            login: "octocat",
            id: 1,
          },
          created_at: "2025-07-15T10:00:00Z",
          updated_at: "2025-07-15T10:00:00Z",
        },
        repository: {
          id: 123456,
          name: "test-repo",
          full_name: "my-org/test-repo",
        },
        sender: {
          login: "octocat",
          id: 1,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "pull_request";
      mockEvent.body = JSON.stringify(prPayload);

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Pull request opened event processed",
          repository: prPayload.repository.full_name,
          pr_number: prPayload.number,
          action: prPayload.action,
        }),
      });
    });

    it("should handle pull request closed event", async () => {
      const prPayload = {
        action: "closed",
        number: 123,
        pull_request: {
          id: 789,
          number: 123,
          title: "Test PR",
          body: "Test PR description",
          state: "closed" as const,
          merged: true,
          merged_at: "2025-07-15T10:05:00Z",
          head: {
            ref: "feature-branch",
            sha: "abc123",
            repo: {
              id: 123456,
              name: "test-repo",
              full_name: "my-org/test-repo",
            },
          },
          base: {
            ref: "main",
            sha: "def456",
            repo: {
              id: 123456,
              name: "test-repo",
              full_name: "my-org/test-repo",
            },
          },
          user: {
            login: "octocat",
            id: 1,
          },
          created_at: "2025-07-15T10:00:00Z",
          updated_at: "2025-07-15T10:05:00Z",
        },
        repository: {
          id: 123456,
          name: "test-repo",
          full_name: "my-org/test-repo",
        },
        sender: {
          login: "octocat",
          id: 1,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "pull_request";
      mockEvent.body = JSON.stringify(prPayload);

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Pull request closed event processed",
          repository: prPayload.repository.full_name,
          pr_number: prPayload.number,
          action: prPayload.action,
        }),
      });
    });
  });

  describe("Issues events", () => {
    it("should handle issue opened event", async () => {
      const issuesPayload = {
        action: "opened",
        issue: {
          id: 123456,
          number: 456,
          title: "Test Issue",
          body: "Test issue description",
          state: "open" as const,
          user: {
            login: "octocat",
            id: 1,
          },
          assignee: {
            login: "assignee",
            id: 2,
          },
          labels: [
            {
              id: 789,
              name: "bug",
              color: "d73a4a",
            },
          ],
          created_at: "2025-07-15T10:00:00Z",
          updated_at: "2025-07-15T10:00:00Z",
        },
        repository: {
          id: 123456,
          name: "test-repo",
          full_name: "my-org/test-repo",
        },
        sender: {
          login: "octocat",
          id: 1,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "issues";
      mockEvent.body = JSON.stringify(issuesPayload);

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Issue opened event processed",
          repository: issuesPayload.repository.full_name,
          issue_number: issuesPayload.issue.number,
          action: issuesPayload.action,
        }),
      });
    });
  });

  describe("Organization events", () => {
    it("should handle organization member added event", async () => {
      const orgPayload = {
        action: "member_added",
        organization: {
          login: "my-org",
          id: 789,
          description: "Test organization",
          public_repos: 10,
          followers: 5,
          following: 3,
          created_at: "2020-01-01T00:00:00Z",
          updated_at: "2025-07-15T10:00:00Z",
        },
        membership: {
          user: {
            login: "new-member",
            id: 123,
          },
          role: "member" as const,
          state: "active" as const,
        },
        sender: {
          login: "octocat",
          id: 1,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "organization";
      mockEvent.body = JSON.stringify(orgPayload);

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Organization member_added event processed",
          organization: orgPayload.organization.login,
          action: orgPayload.action,
        }),
      });
    });
  });

  describe("Team events", () => {
    it("should handle team created event", async () => {
      const teamPayload = {
        action: "created",
        team: {
          id: 123456,
          name: "Test Team",
          slug: "test-team",
          description: "Test team description",
          privacy: "closed" as const,
          permission: "push" as const,
          created_at: "2025-07-15T10:00:00Z",
          updated_at: "2025-07-15T10:00:00Z",
        },
        organization: {
          login: "my-org",
          id: 789,
        },
        sender: {
          login: "octocat",
          id: 1,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "team";
      mockEvent.body = JSON.stringify(teamPayload);

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Team created event processed",
          team: teamPayload.team.name,
          action: teamPayload.action,
        }),
      });
    });
  });

  describe("Audit log events", () => {
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

      mockEvent.headers["X-GitHub-Event"] = "audit_log_streaming";
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

      mockEvent.headers["X-GitHub-Event"] = "audit_log_streaming";
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

    it("should return 400 for invalid audit log payload", async () => {
      const invalidPayload = {
        action: "audit_log_streaming",
        invalid_field: "test",
      };

      mockEvent.headers["X-GitHub-Event"] = "audit_log_streaming";
      mockEvent.body = JSON.stringify(invalidPayload);
      (validateWebhookPayload as jest.Mock).mockReturnValue(false);

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid audit log payload" }),
      });
    });
  });

  describe("Unsupported events", () => {
    it("should return 400 for unsupported GitHub event", async () => {
      mockEvent.headers["X-GitHub-Event"] = "unsupported_event";
      mockEvent.body = JSON.stringify({ action: "test" });

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 400,
        body: JSON.stringify({
          message: "Unsupported GitHub event: unsupported_event",
          supported_events: [
            "ping",
            "repository",
            "push",
            "pull_request",
            "issues",
            "organization",
            "team",
            "audit_log_streaming",
          ],
        }),
      });
    });
  });

  describe("Error handling", () => {
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
      mockEvent.headers["X-GitHub-Event"] = "audit_log_streaming";
      (validateWebhookPayload as jest.Mock).mockReturnValue(false);

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid audit log payload" }),
      });
    });

    it("should handle validator throwing an error", async () => {
      mockEvent.headers["X-GitHub-Event"] = "audit_log_streaming";
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

    it("should handle missing X-GitHub-Event header", async () => {
      mockEvent.body = JSON.stringify({ action: "test" });
      // No X-GitHub-Event header set

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 400,
        body: JSON.stringify({
          message: "Unsupported GitHub event: undefined",
          supported_events: [
            "ping",
            "repository",
            "push",
            "pull_request",
            "issues",
            "organization",
            "team",
            "audit_log_streaming",
          ],
        }),
      });
    });
  });
});
