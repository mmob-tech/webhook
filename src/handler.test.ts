import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import { webhookHandler } from "./handler";
import { generateWebhookSignature } from "./utils/signature";
import { validateWebhookPayload } from "./utils/webhook-validator";

// Mock the validator
jest.mock("./utils/validator", () => ({
  validateWebhookPayload: jest.fn(),
}));

describe("webhookHandler", () => {
  let mockEvent: APIGatewayEvent;
  let mockContext: Context;
  let mockCallback: Callback;
  const testSecret = "test-webhook-secret";

  beforeEach(() => {
    process.env.GITHUB_WEBHOOK_SECRET = testSecret;
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
  describe("Signature validation", () => {
    it("should reject requests without signature", async () => {
      const pingPayload = {
        zen: "Non-blocking is better than blocking.",
        hook_id: 123456,
      };

      mockEvent.headers["X-GitHub-Event"] = "ping";
      mockEvent.body = JSON.stringify(pingPayload);
      // Don't set signature header

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 401,
        body: JSON.stringify({ message: "Missing signature header" }),
      });
    });

    it("should reject requests with invalid signature", async () => {
      const pingPayload = {
        zen: "Non-blocking is better than blocking.",
        hook_id: 123456,
      };

      mockEvent.headers["X-GitHub-Event"] = "ping";
      mockEvent.headers["X-Hub-Signature-256"] = "sha256=invalid-signature";
      mockEvent.body = JSON.stringify(pingPayload);

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid signature" }),
      });
    });

    it("should accept requests with valid signature", async () => {
      const pingPayload = {
        zen: "Non-blocking is better than blocking.",
        hook_id: 123456,
      };

      const body = JSON.stringify(pingPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.headers["X-GitHub-Event"] = "ping";
      mockEvent.body = body;

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
      const body = JSON.stringify(pingPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.body = body;
      mockEvent.headers["X-Hub-Signature-256"] = signature;

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
      const body = JSON.stringify(repoPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;
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
      const body = JSON.stringify(repoPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

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
      const body = JSON.stringify(pushPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

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
      const body = JSON.stringify(prPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

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
      const body = JSON.stringify(prPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

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
      const body = JSON.stringify(issuesPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

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
      const body = JSON.stringify(orgPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

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
      const body = JSON.stringify(teamPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

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

  describe("Workflow Run events", () => {
    it("should handle workflow run completed event", async () => {
      const workflowRunPayload = {
        action: "completed",
        workflow_run: {
          id: 123456,
          name: "Test Workflow",
          node_id: "WFR_123456",
          head_branch: "main",
          head_sha: "abc123",
          path: ".github/workflows/test.yml",
          run_number: 1,
          event: "push",
          display_title: "Test Workflow",
          status: "completed" as const,
          conclusion: "success" as const,
          workflow_id: 789,
          check_suite_id: 456,
          check_suite_node_id: "CS_456",
          url: "https://api.github.com/repos/my-org/test-repo/actions/runs/123456",
          html_url: "https://github.com/my-org/test-repo/actions/runs/123456",
          created_at: "2025-07-15T10:00:00Z",
          updated_at: "2025-07-15T10:05:00Z",
          actor: {
            login: "octocat",
            id: 1,
            avatar_url: "https://github.com/images/error/octocat_happy.gif",
            url: "https://api.github.com/users/octocat",
          },
          run_attempt: 1,
          run_started_at: "2025-07-15T10:00:00Z",
          triggering_actor: {
            login: "octocat",
            id: 1,
            avatar_url: "https://github.com/images/error/octocat_happy.gif",
            url: "https://api.github.com/users/octocat",
          },
          jobs_url:
            "https://api.github.com/repos/my-org/test-repo/actions/runs/123456/jobs",
          logs_url:
            "https://api.github.com/repos/my-org/test-repo/actions/runs/123456/logs",
          check_suite_url:
            "https://api.github.com/repos/my-org/test-repo/check-suites/456",
          artifacts_url:
            "https://api.github.com/repos/my-org/test-repo/actions/runs/123456/artifacts",
          cancel_url:
            "https://api.github.com/repos/my-org/test-repo/actions/runs/123456/cancel",
          rerun_url:
            "https://api.github.com/repos/my-org/test-repo/actions/runs/123456/rerun",
          previous_attempt_url: null,
          workflow_url:
            "https://api.github.com/repos/my-org/test-repo/actions/workflows/789",
          head_commit: {
            id: "abc123",
            tree_id: "def456",
            message: "Test commit",
            timestamp: "2025-07-15T10:00:00Z",
            author: {
              name: "Test Author",
              email: "test@example.com",
            },
            committer: {
              name: "Test Author",
              email: "test@example.com",
            },
          },
          repository: {
            id: 123456,
            name: "test-repo",
            full_name: "my-org/test-repo",
          },
          head_repository: {
            id: 123456,
            name: "test-repo",
            full_name: "my-org/test-repo",
          },
        },
        workflow: {
          id: 789,
          node_id: "W_789",
          name: "Test Workflow",
          path: ".github/workflows/test.yml",
          state: "active",
          created_at: "2025-07-15T09:00:00Z",
          updated_at: "2025-07-15T09:00:00Z",
          url: "https://api.github.com/repos/my-org/test-repo/actions/workflows/789",
          html_url:
            "https://github.com/my-org/test-repo/blob/main/.github/workflows/test.yml",
          badge_url:
            "https://github.com/my-org/test-repo/workflows/Test%20Workflow/badge.svg",
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

      mockEvent.headers["X-GitHub-Event"] = "workflow_run";
      const body = JSON.stringify(workflowRunPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Workflow run completed event processed",
          workflow: workflowRunPayload.workflow_run.name,
          status: workflowRunPayload.workflow_run.status,
          conclusion: workflowRunPayload.workflow_run.conclusion,
          action: workflowRunPayload.action,
        }),
      });
    });
  });

  describe("Workflow Job events", () => {
    it("should handle workflow job completed event", async () => {
      const workflowJobPayload = {
        action: "completed",
        workflow_job: {
          id: 123456,
          run_id: 789,
          workflow_name: "Test Workflow",
          head_branch: "main",
          run_url:
            "https://api.github.com/repos/my-org/test-repo/actions/runs/789",
          run_attempt: 1,
          node_id: "J_123456",
          head_sha: "abc123",
          url: "https://api.github.com/repos/my-org/test-repo/actions/jobs/123456",
          html_url:
            "https://github.com/my-org/test-repo/actions/runs/789/jobs/123456",
          status: "completed" as const,
          conclusion: "success" as const,
          started_at: "2025-07-15T10:00:00Z",
          completed_at: "2025-07-15T10:05:00Z",
          name: "test-job",
          steps: [
            {
              name: "Checkout",
              status: "completed" as const,
              conclusion: "success" as const,
              number: 1,
              started_at: "2025-07-15T10:00:00Z",
              completed_at: "2025-07-15T10:01:00Z",
            },
          ],
          check_run_url:
            "https://api.github.com/repos/my-org/test-repo/check-runs/123456",
          labels: ["ubuntu-latest"],
          runner_id: 1,
          runner_name: "GitHub Actions 1",
          runner_group_id: 1,
          runner_group_name: "Default",
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

      mockEvent.headers["X-GitHub-Event"] = "workflow_job";
      const body = JSON.stringify(workflowJobPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Workflow job completed event processed",
          job: workflowJobPayload.workflow_job.name,
          status: workflowJobPayload.workflow_job.status,
          conclusion: workflowJobPayload.workflow_job.conclusion,
          action: workflowJobPayload.action,
        }),
      });
    });
  });

  describe("Check Suite events", () => {
    it("should handle check suite completed event", async () => {
      const checkSuitePayload = {
        action: "completed",
        check_suite: {
          id: 123456,
          node_id: "CS_123456",
          head_branch: "main",
          head_sha: "abc123",
          status: "completed" as const,
          conclusion: "success" as const,
          url: "https://api.github.com/repos/my-org/test-repo/check-suites/123456",
          before: "def456",
          after: "abc123",
          pull_requests: [],
          app: {
            id: 15368,
            slug: "github-actions",
            node_id: "MDM6QXBwMTUzNjg=",
            owner: {
              login: "github",
              id: 1,
            },
            name: "GitHub Actions",
            description: "GitHub Actions",
            external_url: "https://github.com/features/actions",
            html_url: "https://github.com/apps/github-actions",
            created_at: "2018-07-30T09:30:17Z",
            updated_at: "2019-12-10T19:04:12Z",
          },
          created_at: "2025-07-15T10:00:00Z",
          updated_at: "2025-07-15T10:05:00Z",
          latest_check_runs_count: 1,
          check_runs_url:
            "https://api.github.com/repos/my-org/test-repo/check-suites/123456/check-runs",
          head_commit: {
            id: "abc123",
            tree_id: "def456",
            message: "Test commit",
            timestamp: "2025-07-15T10:00:00Z",
            author: {
              name: "Test Author",
              email: "test@example.com",
            },
            committer: {
              name: "Test Author",
              email: "test@example.com",
            },
          },
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

      mockEvent.headers["X-GitHub-Event"] = "check_suite";
      const body = JSON.stringify(checkSuitePayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Check suite completed event processed",
          head_sha: checkSuitePayload.check_suite.head_sha,
          status: checkSuitePayload.check_suite.status,
          conclusion: checkSuitePayload.check_suite.conclusion,
          action: checkSuitePayload.action,
        }),
      });
    });
  });

  describe("Check Run events", () => {
    it("should handle check run completed event", async () => {
      const checkRunPayload = {
        action: "completed",
        check_run: {
          id: 123456,
          node_id: "CR_123456",
          head_sha: "abc123",
          external_id: "42",
          url: "https://api.github.com/repos/my-org/test-repo/check-runs/123456",
          html_url: "https://github.com/my-org/test-repo/runs/123456",
          details_url: "https://example.com",
          status: "completed" as const,
          conclusion: "success" as const,
          started_at: "2025-07-15T10:00:00Z",
          completed_at: "2025-07-15T10:05:00Z",
          output: {
            title: "Test Results",
            summary: "All tests passed",
            text: "Details about the test results",
            annotations_count: 0,
            annotations_url:
              "https://api.github.com/repos/my-org/test-repo/check-runs/123456/annotations",
          },
          name: "test-check",
          check_suite: {
            id: 789,
            node_id: "CS_789",
            head_branch: "main",
            head_sha: "abc123",
            status: "completed" as const,
            conclusion: "success" as const,
            url: "https://api.github.com/repos/my-org/test-repo/check-suites/789",
            before: "def456",
            after: "abc123",
            pull_requests: [],
            app: {
              id: 15368,
              slug: "github-actions",
              node_id: "MDM6QXBwMTUzNjg=",
              owner: {
                login: "github",
                id: 1,
              },
              name: "GitHub Actions",
              description: "GitHub Actions",
              external_url: "https://github.com/features/actions",
              html_url: "https://github.com/apps/github-actions",
              created_at: "2018-07-30T09:30:17Z",
              updated_at: "2019-12-10T19:04:12Z",
            },
            created_at: "2025-07-15T10:00:00Z",
            updated_at: "2025-07-15T10:05:00Z",
          },
          app: {
            id: 15368,
            slug: "github-actions",
            node_id: "MDM6QXBwMTUzNjg=",
            owner: {
              login: "github",
              id: 1,
            },
            name: "GitHub Actions",
            description: "GitHub Actions",
            external_url: "https://github.com/features/actions",
            html_url: "https://github.com/apps/github-actions",
            created_at: "2018-07-30T09:30:17Z",
            updated_at: "2019-12-10T19:04:12Z",
          },
          pull_requests: [],
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

      mockEvent.headers["X-GitHub-Event"] = "check_run";
      const body = JSON.stringify(checkRunPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Check run completed event processed",
          check_run: checkRunPayload.check_run.name,
          status: checkRunPayload.check_run.status,
          conclusion: checkRunPayload.check_run.conclusion,
          action: checkRunPayload.action,
        }),
      });
    });
  });

  describe("Release events", () => {
    it("should handle release published event", async () => {
      const releasePayload = {
        action: "published",
        release: {
          url: "https://api.github.com/repos/my-org/test-repo/releases/123456",
          assets_url:
            "https://api.github.com/repos/my-org/test-repo/releases/123456/assets",
          upload_url:
            "https://uploads.github.com/repos/my-org/test-repo/releases/123456/assets{?name,label}",
          html_url: "https://github.com/my-org/test-repo/releases/tag/v1.0.0",
          id: 123456,
          node_id: "R_123456",
          tag_name: "v1.0.0",
          target_commitish: "main",
          name: "v1.0.0",
          draft: false,
          author: {
            login: "octocat",
            id: 1,
          },
          prerelease: false,
          created_at: "2025-07-15T10:00:00Z",
          published_at: "2025-07-15T10:05:00Z",
          assets: [],
          tarball_url:
            "https://api.github.com/repos/my-org/test-repo/tarball/v1.0.0",
          zipball_url:
            "https://api.github.com/repos/my-org/test-repo/zipball/v1.0.0",
          body: "Release notes for v1.0.0",
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

      mockEvent.headers["X-GitHub-Event"] = "release";
      const body = JSON.stringify(releasePayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Release published event processed",
          tag_name: releasePayload.release.tag_name,
          name: releasePayload.release.name,
          action: releasePayload.action,
        }),
      });
    });
  });

  describe("Star events", () => {
    it("should handle star created event", async () => {
      const starPayload = {
        action: "created",
        starred_at: "2025-07-15T10:00:00Z",
        repository: {
          id: 123456,
          name: "test-repo",
          full_name: "my-org/test-repo",
          stargazers_count: 42,
          owner: {
            login: "my-org",
            id: 789,
          },
        },
        sender: {
          login: "octocat",
          id: 1,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "star";
      const body = JSON.stringify(starPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Star created event processed",
          repository: starPayload.repository.full_name,
          stargazers_count: starPayload.repository.stargazers_count,
          action: starPayload.action,
        }),
      });
    });
  });

  describe("Watch events", () => {
    it("should handle watch started event", async () => {
      const watchPayload = {
        action: "started",
        repository: {
          id: 123456,
          name: "test-repo",
          full_name: "my-org/test-repo",
          watchers_count: 10,
          owner: {
            login: "my-org",
            id: 789,
          },
        },
        sender: {
          login: "octocat",
          id: 1,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "watch";
      const body = JSON.stringify(watchPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Watch started event processed",
          repository: watchPayload.repository.full_name,
          watchers_count: watchPayload.repository.watchers_count,
          action: watchPayload.action,
        }),
      });
    });
  });

  describe("Fork events", () => {
    it("should handle fork event", async () => {
      const forkPayload = {
        forkee: {
          id: 789,
          name: "test-repo",
          full_name: "forker/test-repo",
          owner: {
            login: "forker",
            id: 2,
          },
          private: false,
          html_url: "https://github.com/forker/test-repo",
          description: "Test repository",
          fork: true,
          created_at: "2025-07-15T10:00:00Z",
          updated_at: "2025-07-15T10:00:00Z",
        },
        repository: {
          id: 123456,
          name: "test-repo",
          full_name: "my-org/test-repo",
          forks_count: 5,
          owner: {
            login: "my-org",
            id: 789,
          },
        },
        sender: {
          login: "forker",
          id: 2,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "fork";
      const body = JSON.stringify(forkPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Fork event processed",
          forked_repository: forkPayload.forkee.full_name,
          original_repository: forkPayload.repository.full_name,
          forks_count: forkPayload.repository.forks_count,
        }),
      });
    });
  });

  describe("Member events", () => {
    it("should handle member added event", async () => {
      const memberPayload = {
        action: "added",
        member: {
          login: "new-member",
          id: 2,
          avatar_url: "https://github.com/images/error/octocat_happy.gif",
          type: "User",
          site_admin: false,
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

      mockEvent.headers["X-GitHub-Event"] = "member";
      const body = JSON.stringify(memberPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Member added event processed",
          member: memberPayload.member.login,
          repository: memberPayload.repository.full_name,
          action: memberPayload.action,
        }),
      });
    });
  });

  describe("Deployment events", () => {
    it("should handle deployment created event", async () => {
      const deploymentPayload = {
        action: "created",
        deployment: {
          url: "https://api.github.com/repos/my-org/test-repo/deployments/123456",
          id: 123456,
          node_id: "D_123456",
          sha: "abc123",
          ref: "main",
          task: "deploy",
          payload: {},
          original_environment: "production",
          environment: "production",
          description: "Deploy to production",
          creator: {
            login: "octocat",
            id: 1,
          },
          created_at: "2025-07-15T10:00:00Z",
          updated_at: "2025-07-15T10:00:00Z",
          statuses_url:
            "https://api.github.com/repos/my-org/test-repo/deployments/123456/statuses",
          repository_url: "https://api.github.com/repos/my-org/test-repo",
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

      mockEvent.headers["X-GitHub-Event"] = "deployment";
      const body = JSON.stringify(deploymentPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Deployment created event processed",
          deployment_id: deploymentPayload.deployment.id,
          environment: deploymentPayload.deployment.environment,
          action: deploymentPayload.action,
        }),
      });
    });
  });

  describe("Deployment Status events", () => {
    it("should handle deployment status created event", async () => {
      const deploymentStatusPayload = {
        action: "created",
        deployment_status: {
          url: "https://api.github.com/repos/my-org/test-repo/deployments/123456/statuses/789",
          id: 789,
          node_id: "DS_789",
          state: "success" as const,
          creator: {
            login: "octocat",
            id: 1,
          },
          description: "Deployment finished successfully",
          environment: "production",
          target_url: "https://my-app.com",
          created_at: "2025-07-15T10:05:00Z",
          updated_at: "2025-07-15T10:05:00Z",
          deployment_url:
            "https://api.github.com/repos/my-org/test-repo/deployments/123456",
          repository_url: "https://api.github.com/repos/my-org/test-repo",
        },
        deployment: {
          url: "https://api.github.com/repos/my-org/test-repo/deployments/123456",
          id: 123456,
          node_id: "D_123456",
          sha: "abc123",
          ref: "main",
          task: "deploy",
          payload: {},
          environment: "production",
          description: "Deploy to production",
          creator: {
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

      mockEvent.headers["X-GitHub-Event"] = "deployment_status";
      const body = JSON.stringify(deploymentStatusPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Deployment status created event processed",
          deployment_id: deploymentStatusPayload.deployment.id,
          state: deploymentStatusPayload.deployment_status.state,
          environment: deploymentStatusPayload.deployment_status.environment,
          action: deploymentStatusPayload.action,
        }),
      });
    });
  });

  describe("Pull Request Review events", () => {
    it("should handle pull request review submitted event", async () => {
      const prReviewPayload = {
        action: "submitted",
        review: {
          id: 123456,
          node_id: "PRR_123456",
          user: {
            login: "reviewer",
            id: 2,
          },
          body: "Looks good to me!",
          commit_id: "abc123",
          submitted_at: "2025-07-15T10:00:00Z",
          state: "approved" as const,
          html_url:
            "https://github.com/my-org/test-repo/pull/1#pullrequestreview-123456",
          pull_request_url:
            "https://api.github.com/repos/my-org/test-repo/pulls/1",
          author_association: "COLLABORATOR",
        },
        pull_request: {
          id: 789,
          number: 1,
          title: "Test PR",
          user: {
            login: "octocat",
            id: 1,
          },
          state: "open" as const,
          merged: false,
          head: {
            ref: "feature-branch",
            sha: "abc123",
          },
          base: {
            ref: "main",
            sha: "def456",
          },
        },
        repository: {
          id: 123456,
          name: "test-repo",
          full_name: "my-org/test-repo",
        },
        sender: {
          login: "reviewer",
          id: 2,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "pull_request_review";
      const body = JSON.stringify(prReviewPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "PR Review submitted event processed",
          pr_number: prReviewPayload.pull_request.number,
          review_state: prReviewPayload.review.state,
          action: prReviewPayload.action,
        }),
      });
    });
  });

  describe("Pull Request Review Comment events", () => {
    it("should handle pull request review comment created event", async () => {
      const prReviewCommentPayload = {
        action: "created",
        comment: {
          id: 123456,
          node_id: "PRRC_123456",
          url: "https://api.github.com/repos/my-org/test-repo/pulls/comments/123456",
          html_url:
            "https://github.com/my-org/test-repo/pull/1#discussion_r123456",
          body: "This line needs to be fixed",
          user: {
            login: "reviewer",
            id: 2,
          },
          created_at: "2025-07-15T10:00:00Z",
          updated_at: "2025-07-15T10:00:00Z",
          author_association: "COLLABORATOR",
          commit_id: "abc123",
          original_commit_id: "abc123",
          diff_hunk:
            "@@ -1,4 +1,4 @@\n line1\n-line2\n+line2 updated\n line3\n line4",
          path: "src/test.js",
          position: 2,
          original_position: 2,
          pull_request_review_id: 789,
          pull_request_url:
            "https://api.github.com/repos/my-org/test-repo/pulls/1",
        },
        pull_request: {
          id: 789,
          number: 1,
          title: "Test PR",
          user: {
            login: "octocat",
            id: 1,
          },
          state: "open" as const,
          merged: false,
          head: {
            ref: "feature-branch",
            sha: "abc123",
          },
          base: {
            ref: "main",
            sha: "def456",
          },
        },
        repository: {
          id: 123456,
          name: "test-repo",
          full_name: "my-org/test-repo",
        },
        sender: {
          login: "reviewer",
          id: 2,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "pull_request_review_comment";
      const body = JSON.stringify(prReviewCommentPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "PR Review Comment created event processed",
          pr_number: prReviewCommentPayload.pull_request.number,
          comment_id: prReviewCommentPayload.comment.id,
          action: prReviewCommentPayload.action,
        }),
      });
    });
  });

  describe("Issue Comment events", () => {
    it("should handle issue comment created event", async () => {
      const issueCommentPayload = {
        action: "created",
        issue: {
          id: 123456,
          number: 1,
          title: "Test Issue",
          user: {
            login: "octocat",
            id: 1,
          },
          state: "open" as const,
          body: "Test issue description",
          created_at: "2025-07-15T10:00:00Z",
          updated_at: "2025-07-15T10:00:00Z",
        },
        comment: {
          id: 789,
          node_id: "C_789",
          url: "https://api.github.com/repos/my-org/test-repo/issues/comments/789",
          html_url:
            "https://github.com/my-org/test-repo/issues/1#issuecomment-789",
          body: "This is a test comment",
          user: {
            login: "commenter",
            id: 2,
          },
          created_at: "2025-07-15T10:05:00Z",
          updated_at: "2025-07-15T10:05:00Z",
          author_association: "CONTRIBUTOR",
        },
        repository: {
          id: 123456,
          name: "test-repo",
          full_name: "my-org/test-repo",
        },
        sender: {
          login: "commenter",
          id: 2,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "issue_comment";
      const body = JSON.stringify(issueCommentPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Issue comment created event processed",
          issue_number: issueCommentPayload.issue.number,
          comment_id: issueCommentPayload.comment.id,
          action: issueCommentPayload.action,
        }),
      });
    });
  });

  describe("Commit Comment events", () => {
    it("should handle commit comment created event", async () => {
      const commitCommentPayload = {
        action: "created",
        comment: {
          id: 123456,
          node_id: "CC_123456",
          url: "https://api.github.com/repos/my-org/test-repo/comments/123456",
          html_url:
            "https://github.com/my-org/test-repo/commit/abc123#commitcomment-123456",
          body: "This commit looks good",
          user: {
            login: "commenter",
            id: 2,
          },
          position: 1,
          line: 5,
          path: "src/test.js",
          commit_id: "abc123",
          created_at: "2025-07-15T10:00:00Z",
          updated_at: "2025-07-15T10:00:00Z",
          author_association: "CONTRIBUTOR",
        },
        repository: {
          id: 123456,
          name: "test-repo",
          full_name: "my-org/test-repo",
        },
        sender: {
          login: "commenter",
          id: 2,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "commit_comment";
      const body = JSON.stringify(commitCommentPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Commit comment created event processed",
          commit_id: commitCommentPayload.comment.commit_id,
          comment_id: commitCommentPayload.comment.id,
          action: commitCommentPayload.action,
        }),
      });
    });
  });

  describe("Create events", () => {
    it("should handle create branch event", async () => {
      const createPayload = {
        ref: "feature-branch",
        ref_type: "branch" as const,
        master_branch: "main",
        description: "Test repository",
        pusher_type: "user",
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

      mockEvent.headers["X-GitHub-Event"] = "create";
      const body = JSON.stringify(createPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Create branch event processed",
          ref: createPayload.ref,
          ref_type: createPayload.ref_type,
          repository: createPayload.repository.full_name,
        }),
      });
    });

    it("should handle create tag event", async () => {
      const createPayload = {
        ref: "v1.0.0",
        ref_type: "tag" as const,
        master_branch: "main",
        description: "Test repository",
        pusher_type: "user",
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

      mockEvent.headers["X-GitHub-Event"] = "create";
      const body = JSON.stringify(createPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Create tag event processed",
          ref: createPayload.ref,
          ref_type: createPayload.ref_type,
          repository: createPayload.repository.full_name,
        }),
      });
    });
  });

  describe("Delete events", () => {
    it("should handle delete branch event", async () => {
      const deletePayload = {
        ref: "feature-branch",
        ref_type: "branch" as const,
        pusher_type: "user",
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

      mockEvent.headers["X-GitHub-Event"] = "delete";
      const body = JSON.stringify(deletePayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Delete branch event processed",
          ref: deletePayload.ref,
          ref_type: deletePayload.ref_type,
          repository: deletePayload.repository.full_name,
        }),
      });
    });

    it("should handle delete tag event", async () => {
      const deletePayload = {
        ref: "v1.0.0",
        ref_type: "tag" as const,
        pusher_type: "user",
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

      mockEvent.headers["X-GitHub-Event"] = "delete";
      const body = JSON.stringify(deletePayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Delete tag event processed",
          ref: deletePayload.ref,
          ref_type: deletePayload.ref_type,
          repository: deletePayload.repository.full_name,
        }),
      });
    });
  });

  describe("Status events", () => {
    it("should handle status event", async () => {
      const statusPayload = {
        id: 123456,
        sha: "abc123",
        name: "continuous-integration/travis-ci",
        target_url: "https://travis-ci.org/my-org/test-repo/builds/123456",
        context: "continuous-integration/travis-ci",
        description: "Build passed",
        state: "success" as const,
        commit: {
          sha: "abc123",
          commit: {
            author: {
              name: "Test Author",
              email: "test@example.com",
              date: "2025-07-15T10:00:00Z",
            },
            committer: {
              name: "Test Author",
              email: "test@example.com",
              date: "2025-07-15T10:00:00Z",
            },
            message: "Test commit",
          },
          url: "https://api.github.com/repos/my-org/test-repo/commits/abc123",
          html_url: "https://github.com/my-org/test-repo/commit/abc123",
          comments_url:
            "https://api.github.com/repos/my-org/test-repo/commits/abc123/comments",
          author: {
            login: "octocat",
            id: 1,
          },
          committer: {
            login: "octocat",
            id: 1,
          },
        },
        branches: [
          {
            name: "main",
            commit: {
              sha: "abc123",
              url: "https://api.github.com/repos/my-org/test-repo/commits/abc123",
            },
            protected: true,
          },
        ],
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

      mockEvent.headers["X-GitHub-Event"] = "status";
      const body = JSON.stringify(statusPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Status event processed",
          state: statusPayload.state,
          context: statusPayload.context,
          sha: statusPayload.sha,
        }),
      });
    });
  });

  describe("Discussion events", () => {
    it("should handle discussion created event", async () => {
      const discussionPayload = {
        action: "created",
        discussion: {
          id: 123456,
          node_id: "D_123456",
          url: "https://api.github.com/repos/my-org/test-repo/discussions/123456",
          html_url: "https://github.com/my-org/test-repo/discussions/1",
          category: {
            id: 789,
            node_id: "DC_789",
            name: "General",
            emoji: "💬",
            description: "General discussion",
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z",
            slug: "general",
            is_answerable: false,
          },
          number: 1,
          title: "Test Discussion",
          user: {
            login: "octocat",
            id: 1,
          },
          state: "open" as const,
          locked: false,
          comments: 0,
          created_at: "2025-07-15T10:00:00Z",
          updated_at: "2025-07-15T10:00:00Z",
          author_association: "OWNER",
          body: "This is a test discussion",
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

      mockEvent.headers["X-GitHub-Event"] = "discussion";
      const body = JSON.stringify(discussionPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Discussion created event processed",
          discussion_number: discussionPayload.discussion.number,
          title: discussionPayload.discussion.title,
          action: discussionPayload.action,
        }),
      });
    });
  });

  describe("Discussion Comment events", () => {
    it("should handle discussion comment created event", async () => {
      const discussionCommentPayload = {
        action: "created",
        comment: {
          id: 123456,
          node_id: "DC_123456",
          url: "https://api.github.com/repos/my-org/test-repo/discussions/comments/123456",
          html_url:
            "https://github.com/my-org/test-repo/discussions/1#discussioncomment-123456",
          body: "This is a great discussion!",
          user: {
            login: "commenter",
            id: 2,
          },
          created_at: "2025-07-15T10:05:00Z",
          updated_at: "2025-07-15T10:05:00Z",
          author_association: "CONTRIBUTOR",
          child_comment_count: 0,
        },
        discussion: {
          id: 789,
          node_id: "D_789",
          url: "https://api.github.com/repos/my-org/test-repo/discussions/789",
          html_url: "https://github.com/my-org/test-repo/discussions/1",
          category: {
            id: 456,
            node_id: "DC_456",
            name: "General",
            emoji: "💬",
            description: "General discussion",
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z",
            slug: "general",
            is_answerable: false,
          },
          number: 1,
          title: "Test Discussion",
          user: {
            login: "octocat",
            id: 1,
          },
          state: "open" as const,
          locked: false,
          comments: 1,
          created_at: "2025-07-15T10:00:00Z",
          updated_at: "2025-07-15T10:05:00Z",
          author_association: "OWNER",
          body: "This is a test discussion",
        },
        repository: {
          id: 123456,
          name: "test-repo",
          full_name: "my-org/test-repo",
        },
        sender: {
          login: "commenter",
          id: 2,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "discussion_comment";
      const body = JSON.stringify(discussionCommentPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Discussion comment created event processed",
          discussion_number: discussionCommentPayload.discussion.number,
          comment_id: discussionCommentPayload.comment.id,
          action: discussionCommentPayload.action,
        }),
      });
    });
  });

  describe("Package events", () => {
    it("should handle package published event", async () => {
      const packagePayload = {
        action: "published",
        package: {
          id: 123456,
          name: "test-package",
          namespace: "my-org",
          description: "Test package",
          ecosystem: "npm",
          package_type: "npm",
          html_url: "https://github.com/my-org/test-package",
          created_at: "2025-07-15T10:00:00Z",
          updated_at: "2025-07-15T10:05:00Z",
          owner: {
            login: "my-org",
            id: 789,
          },
          package_version: {
            id: 789,
            version: "1.0.0",
            summary: "Test package version",
            name: "test-package",
            description: "Test package description",
            body: "Test package body",
            body_html: "<p>Test package body</p>",
            release: {
              url: "https://api.github.com/repos/my-org/test-package/releases/123",
              html_url:
                "https://github.com/my-org/test-package/releases/tag/v1.0.0",
              id: 123,
              tag_name: "v1.0.0",
              target_commitish: "main",
              name: "v1.0.0",
              draft: false,
              prerelease: false,
              created_at: "2025-07-15T10:00:00Z",
              published_at: "2025-07-15T10:05:00Z",
            },
            manifest: "{}",
            html_url:
              "https://github.com/my-org/test-package/releases/tag/v1.0.0",
            tag_name: "v1.0.0",
            target_commitish: "main",
            target_oid: "abc123",
            draft: false,
            prerelease: false,
            created_at: "2025-07-15T10:00:00Z",
            updated_at: "2025-07-15T10:05:00Z",
            metadata: [
              {
                package_type: "npm",
              },
            ],
            package_files: [
              {
                download_url:
                  "https://npm.pkg.github.com/download/test-package/1.0.0",
                id: 456,
                name: "test-package-1.0.0.tgz",
                sha256: "abc123",
                sha1: "def456",
                md5: "ghi789",
                content_type: "application/gzip",
                state: "uploaded",
                size: 1024,
                created_at: "2025-07-15T10:00:00Z",
                updated_at: "2025-07-15T10:05:00Z",
              },
            ],
            author: {
              login: "octocat",
              id: 1,
            },
            installation_command: "npm install @my-org/test-package@1.0.0",
          },
          registry: {
            about_url: "https://github.com/features/packages",
            name: "GitHub npm registry",
            type: "npm",
            url: "https://npm.pkg.github.com",
            vendor: "GitHub Inc",
          },
        },
        repository: {
          id: 123456,
          name: "test-package",
          full_name: "my-org/test-package",
        },
        sender: {
          login: "octocat",
          id: 1,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "package";
      const body = JSON.stringify(packagePayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Package published event processed",
          package_name: packagePayload.package.name,
          package_type: packagePayload.package.package_type,
          action: packagePayload.action,
        }),
      });
    });
  });

  describe("Gollum events", () => {
    it("should handle gollum event", async () => {
      const gollumPayload = {
        pages: [
          {
            page_name: "Home",
            title: "Home",
            summary: "Updated home page",
            action: "edited" as const,
            sha: "abc123",
            html_url: "https://github.com/my-org/test-repo/wiki/Home",
          },
          {
            page_name: "Installation",
            title: "Installation",
            action: "created" as const,
            sha: "def456",
            html_url: "https://github.com/my-org/test-repo/wiki/Installation",
          },
        ],
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

      mockEvent.headers["X-GitHub-Event"] = "gollum";
      const body = JSON.stringify(gollumPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Gollum event processed",
          pages_count: gollumPayload.pages.length,
          repository: gollumPayload.repository.full_name,
        }),
      });
    });
  });

  describe("Audit Log events", () => {
    it("should handle audit log streaming event", async () => {
      const auditLogPayload = {
        action: "audit_log_streaming",
        audit_log_events: [
          {
            action: "repo.create",
            actor: {
              login: "octocat",
              id: 1,
            },
            created_at: "2025-07-15T10:00:00Z",
            resource: "test-repo",
            resource_id: 123456,
            resource_type: "repository",
            organization: {
              login: "my-org",
              id: 789,
            },
            repository: {
              name: "test-repo",
              id: 123456,
              full_name: "my-org/test-repo",
            },
            data: {
              visibility: "private",
            },
          },
          {
            action: "user.login",
            actor: {
              login: "octocat",
              id: 1,
            },
            created_at: "2025-07-15T10:01:00Z",
            resource: "octocat",
            resource_id: 1,
            resource_type: "user",
            data: {
              login_method: "web",
            },
          },
        ],
        organization: {
          login: "my-org",
          id: 789,
        },
        sender: {
          login: "github[bot]",
          id: 27856297,
        },
        installation: {
          id: 12345,
        },
      };

      // Mock the validator to return true
      (validateWebhookPayload as jest.Mock).mockReturnValue(true);

      mockEvent.headers["X-GitHub-Event"] = "audit_log_streaming";
      const body = JSON.stringify(auditLogPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(validateWebhookPayload).toHaveBeenCalledWith(auditLogPayload);
      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Audit log events processed successfully",
          processed_events: auditLogPayload.audit_log_events.length,
        }),
      });
    });

    it("should handle invalid audit log payload", async () => {
      const invalidPayload = {
        action: "audit_log_streaming",
        audit_log_events: [],
        organization: {
          login: "my-org",
          id: 789,
        },
        sender: {
          login: "github[bot]",
          id: 27856297,
        },
      };

      // Mock the validator to return false
      (validateWebhookPayload as jest.Mock).mockReturnValue(false);

      mockEvent.headers["X-GitHub-Event"] = "audit_log_streaming";
      const body = JSON.stringify(invalidPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(validateWebhookPayload).toHaveBeenCalledWith(invalidPayload);
      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid audit log payload" }),
      });
    });
  });

  describe("Unsupported events", () => {
    it("should handle unsupported event type", async () => {
      const unsupportedPayload = {
        action: "test",
        data: "test data",
      };

      mockEvent.headers["X-GitHub-Event"] = "unsupported_event";
      const body = JSON.stringify(unsupportedPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

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
            "workflow_run",
            "workflow_job",
            "check_suite",
            "check_run",
            "release",
            "star",
            "watch",
            "fork",
            "member",
            "deployment",
            "deployment_status",
            "pull_request_review",
            "pull_request_review_comment",
            "issue_comment",
            "commit_comment",
            "create",
            "delete",
            "status",
            "discussion",
            "discussion_comment",
            "package",
            "gollum",
            "audit_log_streaming",
          ],
        }),
      });
    });
  });

  describe("Error handling", () => {
    it("should handle JSON parsing errors", async () => {
      mockEvent.headers["X-GitHub-Event"] = "ping";
      const body = "invalid json";
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

      await webhookHandler(mockEvent, mockContext, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, {
        statusCode: 500,
        body: JSON.stringify({ message: "Internal server error" }),
      });
    });

    it("should handle missing GitHub event header", async () => {
      const pingPayload = {
        zen: "Non-blocking is better than blocking.",
        hook_id: 123456,
      };

      const body = JSON.stringify(pingPayload);
      const signature = generateWebhookSignature(body, testSecret);
      mockEvent.headers["X-Hub-Signature-256"] = signature;
      mockEvent.body = body;

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
            "workflow_run",
            "workflow_job",
            "check_suite",
            "check_run",
            "release",
            "star",
            "watch",
            "fork",
            "member",
            "deployment",
            "deployment_status",
            "pull_request_review",
            "pull_request_review_comment",
            "issue_comment",
            "commit_comment",
            "create",
            "delete",
            "status",
            "discussion",
            "discussion_comment",
            "package",
            "gollum",
            "audit_log_streaming",
          ],
        }),
      });
    });
  });
});
