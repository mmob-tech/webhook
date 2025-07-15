import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import {
  AuditLogEvent,
  GitHubAuditLogWebhookPayload,
  GitHubIssuesPayload,
  GitHubOrganizationPayload,
  GitHubPingPayload,
  GitHubPullRequestPayload,
  GitHubPushPayload,
  GitHubRepositoryPayload,
  GitHubTeamPayload,
  WebhookPayload,
} from "./types/webhook";
import { validateWebhookPayload } from "./utils/validator";

export const webhookHandler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback
) => {
  try {
    // Get the GitHub event type from headers
    const githubEvent =
      event.headers["X-GitHub-Event"] || event.headers["x-github-event"];

    const payload: WebhookPayload = JSON.parse(event.body || "{}");

    console.log(`Received GitHub webhook event: ${githubEvent}`);

    // Handle ping event
    if (githubEvent === "ping") {
      const pingPayload = payload as GitHubPingPayload;
      console.log("Received ping event:", pingPayload.zen);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Ping received successfully",
          zen: pingPayload.zen,
          hook_id: pingPayload.hook_id,
        }),
      });
    }

    // Handle repository events
    if (githubEvent === "repository") {
      const repoPayload = payload as GitHubRepositoryPayload;
      console.log(
        `Repository ${repoPayload.action}: ${repoPayload.repository.full_name}`
      );

      await processRepositoryEvent(repoPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Repository ${repoPayload.action} event processed`,
          repository: repoPayload.repository.full_name,
          action: repoPayload.action,
        }),
      });
    }

    // Handle push events
    if (githubEvent === "push") {
      const pushPayload = payload as GitHubPushPayload;
      console.log(
        `Push to ${pushPayload.repository.full_name} on ${pushPayload.ref}`
      );
      console.log(`${pushPayload.commits.length} commits pushed`);

      await processPushEvent(pushPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Push event processed",
          repository: pushPayload.repository.full_name,
          ref: pushPayload.ref,
          commits: pushPayload.commits.length,
        }),
      });
    }

    // Handle pull request events
    if (githubEvent === "pull_request") {
      const prPayload = payload as GitHubPullRequestPayload;
      console.log(
        `Pull request ${prPayload.action}: #${prPayload.number} in ${prPayload.repository.full_name}`
      );

      await processPullRequestEvent(prPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Pull request ${prPayload.action} event processed`,
          repository: prPayload.repository.full_name,
          pr_number: prPayload.number,
          action: prPayload.action,
        }),
      });
    }

    // Handle issues events
    if (githubEvent === "issues") {
      const issuesPayload = payload as GitHubIssuesPayload;
      console.log(
        `Issue ${issuesPayload.action}: #${issuesPayload.issue.number} in ${issuesPayload.repository.full_name}`
      );

      await processIssuesEvent(issuesPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Issue ${issuesPayload.action} event processed`,
          repository: issuesPayload.repository.full_name,
          issue_number: issuesPayload.issue.number,
          action: issuesPayload.action,
        }),
      });
    }

    // Handle organization events
    if (githubEvent === "organization") {
      const orgPayload = payload as GitHubOrganizationPayload;
      console.log(
        `Organization ${orgPayload.action}: ${orgPayload.organization.login}`
      );

      await processOrganizationEvent(orgPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Organization ${orgPayload.action} event processed`,
          organization: orgPayload.organization.login,
          action: orgPayload.action,
        }),
      });
    }

    // Handle team events
    if (githubEvent === "team") {
      const teamPayload = payload as GitHubTeamPayload;
      console.log(`Team ${teamPayload.action}: ${teamPayload.team.name}`);

      await processTeamEvent(teamPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Team ${teamPayload.action} event processed`,
          team: teamPayload.team.name,
          action: teamPayload.action,
        }),
      });
    }

    // Handle audit log streaming events
    if (githubEvent === "audit_log_streaming") {
      const auditPayload = payload as GitHubAuditLogWebhookPayload;

      // Validate the incoming payload
      const isValid = validateWebhookPayload(auditPayload);
      if (!isValid) {
        return callback(null, {
          statusCode: 400,
          body: JSON.stringify({ message: "Invalid audit log payload" }),
        });
      }

      // Process each audit log event
      for (const auditEvent of auditPayload.audit_log_events) {
        await processAuditLogEvent(auditEvent, auditPayload.organization);
      }

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Audit log events processed successfully",
          processed_events: auditPayload.audit_log_events.length,
        }),
      });
    }

    // Handle unsupported events
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        message: `Unsupported GitHub event: ${githubEvent}`,
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
  } catch (error) {
    console.error("Error processing webhook:", error);
    return callback(null, {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    });
  }
};

// Event processing functions
const processRepositoryEvent = async (
  payload: GitHubRepositoryPayload
): Promise<void> => {
  console.log(`Processing repository event: ${payload.action}`);

  switch (payload.action) {
    case "created":
      console.log(`New repository created: ${payload.repository.full_name}`);
      // Add your repository creation logic here
      break;
    case "deleted":
      console.log(`Repository deleted: ${payload.repository.full_name}`);
      // Add your repository deletion logic here
      break;
    case "archived":
      console.log(`Repository archived: ${payload.repository.full_name}`);
      // Add your repository archival logic here
      break;
    case "privatized":
      console.log(`Repository made private: ${payload.repository.full_name}`);
      // Add your repository privatization logic here
      break;
    case "publicized":
      console.log(`Repository made public: ${payload.repository.full_name}`);
      // Add your repository publicization logic here
      break;
    default:
      console.log(`Unhandled repository action: ${payload.action}`);
  }
};

const processPushEvent = async (payload: GitHubPushPayload): Promise<void> => {
  console.log(`Processing push event to ${payload.repository.full_name}`);

  // Process each commit
  for (const commit of payload.commits) {
    console.log(`Commit ${commit.id.substring(0, 7)}: ${commit.message}`);
    console.log(`Author: ${commit.author.name} <${commit.author.email}>`);
  }

  // Add your push event processing logic here
  // E.g., trigger CI/CD, send notifications, etc.
};

const processPullRequestEvent = async (
  payload: GitHubPullRequestPayload
): Promise<void> => {
  console.log(`Processing pull request event: ${payload.action}`);

  switch (payload.action) {
    case "opened":
      console.log(`New PR opened: #${payload.pull_request.number}`);
      console.log(`Title: ${payload.pull_request.title}`);
      console.log(`Author: ${payload.pull_request.user.login}`);
      // Add your PR opened logic here
      break;
    case "closed":
      if (payload.pull_request.merged) {
        console.log(`PR merged: #${payload.pull_request.number}`);
        // Add your PR merged logic here
      } else {
        console.log(`PR closed without merge: #${payload.pull_request.number}`);
        // Add your PR closed logic here
      }
      break;
    case "synchronize":
      console.log(`PR updated: #${payload.pull_request.number}`);
      // Add your PR synchronization logic here
      break;
    default:
      console.log(`Unhandled PR action: ${payload.action}`);
  }
};

const processIssuesEvent = async (
  payload: GitHubIssuesPayload
): Promise<void> => {
  console.log(`Processing issues event: ${payload.action}`);

  switch (payload.action) {
    case "opened":
      console.log(`New issue opened: #${payload.issue.number}`);
      console.log(`Title: ${payload.issue.title}`);
      console.log(`Author: ${payload.issue.user.login}`);
      // Add your issue opened logic here
      break;
    case "closed":
      console.log(`Issue closed: #${payload.issue.number}`);
      // Add your issue closed logic here
      break;
    case "labeled":
      console.log(`Issue labeled: #${payload.issue.number}`);
      // Add your issue labeling logic here
      break;
    default:
      console.log(`Unhandled issue action: ${payload.action}`);
  }
};

const processOrganizationEvent = async (
  payload: GitHubOrganizationPayload
): Promise<void> => {
  console.log(`Processing organization event: ${payload.action}`);

  switch (payload.action) {
    case "member_added":
      console.log(
        `Member added to organization: ${payload.organization.login}`
      );
      // Add your member added logic here
      break;
    case "member_removed":
      console.log(
        `Member removed from organization: ${payload.organization.login}`
      );
      // Add your member removed logic here
      break;
    default:
      console.log(`Unhandled organization action: ${payload.action}`);
  }
};

const processTeamEvent = async (payload: GitHubTeamPayload): Promise<void> => {
  console.log(`Processing team event: ${payload.action}`);

  switch (payload.action) {
    case "created":
      console.log(`New team created: ${payload.team.name}`);
      // Add your team creation logic here
      break;
    case "deleted":
      console.log(`Team deleted: ${payload.team.name}`);
      // Add your team deletion logic here
      break;
    case "added_to_repository":
      console.log(`Team added to repository: ${payload.team.name}`);
      // Add your team repository access logic here
      break;
    default:
      console.log(`Unhandled team action: ${payload.action}`);
  }
};

const processAuditLogEvent = async (
  event: AuditLogEvent,
  organization: any
): Promise<void> => {
  console.log(
    `Processing audit event: ${event.action} by ${event.actor.login}`
  );

  // Handle different audit log event types
  switch (event.action) {
    case "repo.create":
      console.log(`Repository created: ${event.resource}`);
      // Add your audit log processing logic here
      break;
    case "repo.destroy":
      console.log(`Repository deleted: ${event.resource}`);
      // Add your audit log processing logic here
      break;
    case "team.create":
      console.log(`Team created: ${event.resource}`);
      // Add your audit log processing logic here
      break;
    case "org.invite_member":
      console.log(`Member invited to org: ${event.resource}`);
      // Add your audit log processing logic here
      break;
    case "user.login":
      console.log(`User login: ${event.actor.login}`);
      // Add your audit log processing logic here
      break;
    case "user.logout":
      console.log(`User logout: ${event.actor.login}`);
      // Add your audit log processing logic here
      break;
    default:
      console.log(`Unhandled audit event: ${event.action}`);
  }
};
