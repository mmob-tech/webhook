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
      mockEvent.body = JSON.stringify(workflowRunPayload);

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
      mockEvent.body = JSON.stringify(workflowJobPayload);

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
      mockEvent.body = JSON.stringify(releasePayload);

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
        },
        sender: {
          login: "octocat",
          id: 1,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "star";
      mockEvent.body = JSON.stringify(starPayload);

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
        },
        sender: {
          login: "octocat",
          id: 1,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "watch";
      mockEvent.body = JSON.stringify(watchPayload);

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
        },
        sender: {
          login: "forker",
          id: 2,
        },
      };

      mockEvent.headers["X-GitHub-Event"] = "fork";
      mockEvent.body = JSON.stringify(forkPayload);

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
      mockEvent.body = JSON.stringify(memberPayload);

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
      mockEvent.body = JSON.stringify(issueCommentPayload);

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
      mockEvent.body = JSON.stringify(createPayload);

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
      mockEvent.body = JSON.stringify(deletePayload);

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
            "issue_comment",
            "create",
            "delete",
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
            "issue_comment",
            "create",
            "delete",
            "audit_log_streaming",
          ],
        }),
      });
    });
  });
});
