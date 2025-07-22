import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import { logWebhookEvent } from "./utils/logging";

import {
  AuditLogEvent,
  GitHubAuditLogWebhookPayload,
  GitHubCheckRunPayload,
  GitHubCheckSuitePayload,
  GitHubCommitCommentPayload,
  GitHubCreatePayload,
  GitHubDeletePayload,
  GitHubDependabotAlertPayload,
  GitHubDeploymentPayload,
  GitHubDeploymentStatusPayload,
  GitHubDiscussionCommentPayload,
  GitHubDiscussionPayload,
  GitHubForkPayload,
  GitHubGollumPayload,
  GitHubIssueCommentPayload,
  GitHubIssuesPayload,
  GitHubMemberPayload,
  GitHubOrganizationPayload,
  GitHubPackagePayload,
  GitHubPingPayload,
  GitHubPullRequestPayload,
  GitHubPullRequestReviewCommentPayload,
  GitHubPullRequestReviewPayload,
  GitHubPushPayload,
  GitHubReleasePayload,
  GitHubRepositoryPayload,
  GitHubStarPayload,
  GitHubStatusPayload,
  GitHubTeamPayload,
  GitHubWatchPayload,
  GitHubWorkflowJobPayload,
  GitHubWorkflowRunPayload,
  WebhookPayload,
} from "./types/webhook";
import { generateHealthCheckData } from "./utils/health";
import { verifyGitHubSignature } from "./utils/signature";
import { validateWebhookPayload } from "./utils/validator";
export const healthCheck = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback
) => {
  try {
    // Basic health check information
    const healthData = generateHealthCheckData(context);

    return callback(null, {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      body: JSON.stringify(healthData),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return callback(null, {
      statusCode: 503,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      }),
    });
  }
};
export const webhookHandler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback
) => {
  try {
    // Get webhook secret from environment variable
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("GITHUB_WEBHOOK_SECRET environment variable is not set");
      return callback(null, {
        statusCode: 500,
        body: JSON.stringify({ message: "Webhook secret not configured" }),
      });
    }

    // Validate webhook signature
    const signature =
      event.headers["X-Hub-Signature-256"] ||
      event.headers["x-hub-signature-256"];

    if (!signature) {
      console.error("Missing X-Hub-Signature-256 header");
      return callback(null, {
        statusCode: 401,
        body: JSON.stringify({ message: "Missing signature header" }),
      });
    }

    // Verify the signature
    const isValid = verifyGitHubSignature(
      event.body || "",
      signature,
      webhookSecret
    );

    if (!isValid) {
      console.error("Invalid webhook signature");
      return callback(null, {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid signature" }),
      });
    }

    console.log("Webhook signature validated successfully");

    // Get the GitHub event type from headers
    const githubEvent =
      event.headers["X-GitHub-Event"] || event.headers["x-github-event"];

    const payload: WebhookPayload = JSON.parse(event.body || "{}");

    console.log(`Received GitHub webhook event: ${githubEvent}`);
    // Log all webhook events
    await logWebhookEvent(githubEvent as string, payload, event);

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

    // handle dependabot alert events
    if (githubEvent === "dependabot_alert") {
      const dependabotPayload = payload as GitHubDependabotAlertPayload;
      console.log("🔒 Dependabot Alert Event:", {
        action: dependabotPayload.action,
        alert_number: dependabotPayload.alert.number,
        state: dependabotPayload.alert.state,
        package: `${dependabotPayload.alert.dependency.package.ecosystem}:${dependabotPayload.alert.dependency.package.name}`,
        severity: dependabotPayload.alert.security_vulnerability.severity,
        ghsa_id: dependabotPayload.alert.security_advisory.ghsa_id,
        repository: dependabotPayload.repository.full_name,
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

    // Handle workflow run events
    if (githubEvent === "workflow_run") {
      const workflowRunPayload = payload as GitHubWorkflowRunPayload;
      console.log(
        `Workflow run ${workflowRunPayload.action}: ${workflowRunPayload.workflow_run.name}`
      );

      await processWorkflowRunEvent(workflowRunPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Workflow run ${workflowRunPayload.action} event processed`,
          workflow: workflowRunPayload.workflow_run.name,
          status: workflowRunPayload.workflow_run.status,
          conclusion: workflowRunPayload.workflow_run.conclusion,
          action: workflowRunPayload.action,
        }),
      });
    }

    // Handle workflow job events
    if (githubEvent === "workflow_job") {
      const workflowJobPayload = payload as GitHubWorkflowJobPayload;
      console.log(
        `Workflow job ${workflowJobPayload.action}: ${workflowJobPayload.workflow_job.name}`
      );

      await processWorkflowJobEvent(workflowJobPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Workflow job ${workflowJobPayload.action} event processed`,
          job: workflowJobPayload.workflow_job.name,
          status: workflowJobPayload.workflow_job.status,
          conclusion: workflowJobPayload.workflow_job.conclusion,
          action: workflowJobPayload.action,
        }),
      });
    }

    // Handle check suite events
    if (githubEvent === "check_suite") {
      const checkSuitePayload = payload as GitHubCheckSuitePayload;
      console.log(
        `Check suite ${checkSuitePayload.action}: ${checkSuitePayload.check_suite.head_sha}`
      );

      await processCheckSuiteEvent(checkSuitePayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Check suite ${checkSuitePayload.action} event processed`,
          head_sha: checkSuitePayload.check_suite.head_sha,
          status: checkSuitePayload.check_suite.status,
          conclusion: checkSuitePayload.check_suite.conclusion,
          action: checkSuitePayload.action,
        }),
      });
    }

    // Handle check run events
    if (githubEvent === "check_run") {
      const checkRunPayload = payload as GitHubCheckRunPayload;
      console.log(
        `Check run ${checkRunPayload.action}: ${checkRunPayload.check_run.name}`
      );

      await processCheckRunEvent(checkRunPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Check run ${checkRunPayload.action} event processed`,
          check_run: checkRunPayload.check_run.name,
          status: checkRunPayload.check_run.status,
          conclusion: checkRunPayload.check_run.conclusion,
          action: checkRunPayload.action,
        }),
      });
    }

    // Handle release events
    if (githubEvent === "release") {
      const releasePayload = payload as GitHubReleasePayload;
      console.log(
        `Release ${releasePayload.action}: ${releasePayload.release.tag_name}`
      );

      await processReleaseEvent(releasePayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Release ${releasePayload.action} event processed`,
          tag_name: releasePayload.release.tag_name,
          name: releasePayload.release.name,
          action: releasePayload.action,
        }),
      });
    }

    // Handle star events
    if (githubEvent === "star") {
      const starPayload = payload as GitHubStarPayload;
      console.log(
        `Star ${starPayload.action}: ${starPayload.repository.full_name}`
      );

      await processStarEvent(starPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Star ${starPayload.action} event processed`,
          repository: starPayload.repository.full_name,
          stargazers_count: starPayload.repository.stargazers_count,
          action: starPayload.action,
        }),
      });
    }

    // Handle watch events
    if (githubEvent === "watch") {
      const watchPayload = payload as GitHubWatchPayload;
      console.log(
        `Watch ${watchPayload.action}: ${watchPayload.repository.full_name}`
      );

      await processWatchEvent(watchPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Watch ${watchPayload.action} event processed`,
          repository: watchPayload.repository.full_name,
          watchers_count: watchPayload.repository.watchers_count,
          action: watchPayload.action,
        }),
      });
    }

    // Handle fork events
    if (githubEvent === "fork") {
      const forkPayload = payload as GitHubForkPayload;
      console.log(
        `Fork: ${forkPayload.forkee.full_name} from ${forkPayload.repository.full_name}`
      );

      await processForkEvent(forkPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Fork event processed",
          forked_repository: forkPayload.forkee.full_name,
          original_repository: forkPayload.repository.full_name,
          forks_count: forkPayload.repository.forks_count,
        }),
      });
    }

    // Handle member events
    if (githubEvent === "member") {
      const memberPayload = payload as GitHubMemberPayload;
      console.log(
        `Member ${memberPayload.action}: ${memberPayload.member.login}`
      );

      await processMemberEvent(memberPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Member ${memberPayload.action} event processed`,
          member: memberPayload.member.login,
          repository: memberPayload.repository.full_name,
          action: memberPayload.action,
        }),
      });
    }

    // Handle deployment events
    if (githubEvent === "deployment") {
      const deploymentPayload = payload as GitHubDeploymentPayload;
      console.log(
        `Deployment ${deploymentPayload.action}: ${deploymentPayload.deployment.environment}`
      );

      await processDeploymentEvent(deploymentPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Deployment ${deploymentPayload.action} event processed`,
          deployment_id: deploymentPayload.deployment.id,
          environment: deploymentPayload.deployment.environment,
          action: deploymentPayload.action,
        }),
      });
    }

    // Handle deployment status events
    if (githubEvent === "deployment_status") {
      const deploymentStatusPayload = payload as GitHubDeploymentStatusPayload;
      console.log(
        `Deployment status ${deploymentStatusPayload.action}: ${deploymentStatusPayload.deployment_status.state}`
      );

      await processDeploymentStatusEvent(deploymentStatusPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Deployment status ${deploymentStatusPayload.action} event processed`,
          deployment_id: deploymentStatusPayload.deployment.id,
          state: deploymentStatusPayload.deployment_status.state,
          environment: deploymentStatusPayload.deployment_status.environment,
          action: deploymentStatusPayload.action,
        }),
      });
    }

    // Handle pull request review events
    if (githubEvent === "pull_request_review") {
      const prReviewPayload = payload as GitHubPullRequestReviewPayload;
      console.log(
        `PR Review ${prReviewPayload.action}: #${prReviewPayload.pull_request.number}`
      );

      await processPullRequestReviewEvent(prReviewPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `PR Review ${prReviewPayload.action} event processed`,
          pr_number: prReviewPayload.pull_request.number,
          review_state: prReviewPayload.review.state,
          action: prReviewPayload.action,
        }),
      });
    }

    // Handle pull request review comment events
    if (githubEvent === "pull_request_review_comment") {
      const prReviewCommentPayload =
        payload as GitHubPullRequestReviewCommentPayload;
      console.log(
        `PR Review Comment ${prReviewCommentPayload.action}: #${prReviewCommentPayload.pull_request.number}`
      );

      await processPullRequestReviewCommentEvent(prReviewCommentPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `PR Review Comment ${prReviewCommentPayload.action} event processed`,
          pr_number: prReviewCommentPayload.pull_request.number,
          comment_id: prReviewCommentPayload.comment.id,
          action: prReviewCommentPayload.action,
        }),
      });
    }

    // Handle issue comment events
    if (githubEvent === "issue_comment") {
      const issueCommentPayload = payload as GitHubIssueCommentPayload;
      console.log(
        `Issue comment ${issueCommentPayload.action}: #${issueCommentPayload.issue.number}`
      );

      await processIssueCommentEvent(issueCommentPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Issue comment ${issueCommentPayload.action} event processed`,
          issue_number: issueCommentPayload.issue.number,
          comment_id: issueCommentPayload.comment.id,
          action: issueCommentPayload.action,
        }),
      });
    }

    // Handle commit comment events
    if (githubEvent === "commit_comment") {
      const commitCommentPayload = payload as GitHubCommitCommentPayload;
      console.log(
        `Commit comment ${commitCommentPayload.action}: ${commitCommentPayload.comment.commit_id}`
      );

      await processCommitCommentEvent(commitCommentPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Commit comment ${commitCommentPayload.action} event processed`,
          commit_id: commitCommentPayload.comment.commit_id,
          comment_id: commitCommentPayload.comment.id,
          action: commitCommentPayload.action,
        }),
      });
    }

    // Handle create events
    if (githubEvent === "create") {
      const createPayload = payload as GitHubCreatePayload;
      console.log(`Create ${createPayload.ref_type}: ${createPayload.ref}`);

      await processCreateEvent(createPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Create ${createPayload.ref_type} event processed`,
          ref: createPayload.ref,
          ref_type: createPayload.ref_type,
          repository: createPayload.repository.full_name,
        }),
      });
    }

    // Handle delete events
    if (githubEvent === "delete") {
      const deletePayload = payload as GitHubDeletePayload;
      console.log(`Delete ${deletePayload.ref_type}: ${deletePayload.ref}`);

      await processDeleteEvent(deletePayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Delete ${deletePayload.ref_type} event processed`,
          ref: deletePayload.ref,
          ref_type: deletePayload.ref_type,
          repository: deletePayload.repository.full_name,
        }),
      });
    }

    // Handle status events
    if (githubEvent === "status") {
      const statusPayload = payload as GitHubStatusPayload;
      console.log(
        `Status ${statusPayload.state}: ${statusPayload.context} on ${statusPayload.sha}`
      );

      await processStatusEvent(statusPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Status event processed`,
          state: statusPayload.state,
          context: statusPayload.context,
          sha: statusPayload.sha,
        }),
      });
    }

    // Handle discussion events
    if (githubEvent === "discussion") {
      const discussionPayload = payload as GitHubDiscussionPayload;
      console.log(
        `Discussion ${discussionPayload.action}: #${discussionPayload.discussion.number}`
      );

      await processDiscussionEvent(discussionPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Discussion ${discussionPayload.action} event processed`,
          discussion_number: discussionPayload.discussion.number,
          title: discussionPayload.discussion.title,
          action: discussionPayload.action,
        }),
      });
    }

    // Handle discussion comment events
    if (githubEvent === "discussion_comment") {
      const discussionCommentPayload =
        payload as GitHubDiscussionCommentPayload;
      console.log(
        `Discussion comment ${discussionCommentPayload.action}: #${discussionCommentPayload.discussion.number}`
      );

      await processDiscussionCommentEvent(discussionCommentPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Discussion comment ${discussionCommentPayload.action} event processed`,
          discussion_number: discussionCommentPayload.discussion.number,
          comment_id: discussionCommentPayload.comment.id,
          action: discussionCommentPayload.action,
        }),
      });
    }

    // Handle package events
    if (githubEvent === "package") {
      const packagePayload = payload as GitHubPackagePayload;
      console.log(
        `Package ${packagePayload.action}: ${packagePayload.package.name}`
      );

      await processPackageEvent(packagePayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Package ${packagePayload.action} event processed`,
          package_name: packagePayload.package.name,
          package_type: packagePayload.package.package_type,
          action: packagePayload.action,
        }),
      });
    }

    // Handle gollum events (wiki)
    if (githubEvent === "gollum") {
      const gollumPayload = payload as GitHubGollumPayload;
      console.log(`Gollum event: ${gollumPayload.pages.length} pages updated`);

      await processGollumEvent(gollumPayload);

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Gollum event processed",
          pages_count: gollumPayload.pages.length,
          repository: gollumPayload.repository.full_name,
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
      // Currently only capture the repository creation event full name
      break;
    case "deleted":
      console.log(`Repository deleted: ${payload.repository.full_name}`);
      // Currently only capture the repository deletion event full name
      break;
    case "archived":
      console.log(`Repository archived: ${payload.repository.full_name}`);
      // Currently only capture the repository archival event full name
      break;
    case "privatized":
      console.log(`Repository made private: ${payload.repository.full_name}`);
      // Currently only capture the repository privatization event full name
      break;
    case "publicized":
      console.log(`Repository made public: ${payload.repository.full_name}`);
      // Currently only capture the repository publicization event full name
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
  // Add push event processing logic here if any
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
      break;
    case "closed":
      if (payload.pull_request.merged) {
        console.log(`PR merged: #${payload.pull_request.number}`);
      } else {
        console.log(`PR closed without merge: #${payload.pull_request.number}`);
      }
      break;
    case "synchronize":
      console.log(`PR updated: #${payload.pull_request.number}`);
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
      break;
    case "closed":
      console.log(`Issue closed: #${payload.issue.number}`);
      break;
    case "labeled":
      console.log(`Issue labeled: #${payload.issue.number}`);
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
      if (payload.membership?.user) {
        console.log(`User: ${payload.membership.user.login}`);
        console.log(`Role: ${payload.membership.role}`);
      }
      break;
    case "member_removed":
      console.log(
        `Member removed from organization: ${payload.organization.login}`
      );
      if (payload.membership?.user) {
        console.log(`User: ${payload.membership.user.login}`);
      }
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
      break;
    case "deleted":
      console.log(`Team deleted: ${payload.team.name}`);
      break;
    case "added_to_repository":
      console.log(`Team added to repository: ${payload.team.name}`);
      if (payload.repository) {
        console.log(`Repository: ${payload.repository.full_name}`);
      }
      break;
    default:
      console.log(`Unhandled team action: ${payload.action}`);
  }
};

const processWorkflowRunEvent = async (
  payload: GitHubWorkflowRunPayload
): Promise<void> => {
  console.log(`Processing workflow run event: ${payload.action}`);

  switch (payload.action) {
    case "completed":
      console.log(`Workflow completed: ${payload.workflow_run.name}`);
      console.log(`Status: ${payload.workflow_run.status}`);
      console.log(`Conclusion: ${payload.workflow_run.conclusion}`);
      break;
    case "requested":
      console.log(`Workflow requested: ${payload.workflow_run.name}`);
      break;
    case "in_progress":
      console.log(`Workflow in progress: ${payload.workflow_run.name}`);
      break;
    default:
      console.log(`Unhandled workflow run action: ${payload.action}`);
  }
};

const processWorkflowJobEvent = async (
  payload: GitHubWorkflowJobPayload
): Promise<void> => {
  console.log(`Processing workflow job event: ${payload.action}`);

  switch (payload.action) {
    case "queued":
      console.log(`Job queued: ${payload.workflow_job.name}`);
      break;
    case "in_progress":
      console.log(`Job in progress: ${payload.workflow_job.name}`);
      break;
    case "completed":
      console.log(`Job completed: ${payload.workflow_job.name}`);
      console.log(`Status: ${payload.workflow_job.status}`);
      console.log(`Conclusion: ${payload.workflow_job.conclusion}`);
      break;
    default:
      console.log(`Unhandled workflow job action: ${payload.action}`);
  }
};

const processCheckSuiteEvent = async (
  payload: GitHubCheckSuitePayload
): Promise<void> => {
  console.log(`Processing check suite event: ${payload.action}`);

  switch (payload.action) {
    case "completed":
      console.log(`Check suite completed: ${payload.check_suite.head_sha}`);
      console.log(`Status: ${payload.check_suite.status}`);
      console.log(`Conclusion: ${payload.check_suite.conclusion}`);
      break;
    case "requested":
      console.log(`Check suite requested: ${payload.check_suite.head_sha}`);
      break;
    default:
      console.log(`Unhandled check suite action: ${payload.action}`);
  }
};

const processCheckRunEvent = async (
  payload: GitHubCheckRunPayload
): Promise<void> => {
  console.log(`Processing check run event: ${payload.action}`);

  switch (payload.action) {
    case "created":
      console.log(`Check run created: ${payload.check_run.name}`);
      break;
    case "completed":
      console.log(`Check run completed: ${payload.check_run.name}`);
      console.log(`Status: ${payload.check_run.status}`);
      console.log(`Conclusion: ${payload.check_run.conclusion}`);
      break;
    default:
      console.log(`Unhandled check run action: ${payload.action}`);
  }
};

const processReleaseEvent = async (
  payload: GitHubReleasePayload
): Promise<void> => {
  console.log(`Processing release event: ${payload.action}`);

  switch (payload.action) {
    case "published":
      console.log(`Release published: ${payload.release.tag_name}`);
      console.log(`Name: ${payload.release.name}`);
      console.log(`Draft: ${payload.release.draft}`);
      console.log(`Prerelease: ${payload.release.prerelease}`);
      break;
    case "created":
      console.log(`Release created: ${payload.release.tag_name}`);
      break;
    case "edited":
      console.log(`Release edited: ${payload.release.tag_name}`);
      break;
    default:
      console.log(`Unhandled release action: ${payload.action}`);
  }
};

const processStarEvent = async (payload: GitHubStarPayload): Promise<void> => {
  console.log(`Processing star event: ${payload.action}`);

  switch (payload.action) {
    case "created":
      console.log(`Repository starred: ${payload.repository.full_name}`);
      console.log(`By: ${payload.sender.login}`);
      console.log(`Total stars: ${payload.repository.stargazers_count}`);
      break;
    case "deleted":
      console.log(`Repository unstarred: ${payload.repository.full_name}`);
      console.log(`By: ${payload.sender.login}`);
      console.log(`Total stars: ${payload.repository.stargazers_count}`);
      break;
    default:
      console.log(`Unhandled star action: ${payload.action}`);
  }
};

const processWatchEvent = async (
  payload: GitHubWatchPayload
): Promise<void> => {
  console.log(`Processing watch event: ${payload.action}`);

  switch (payload.action) {
    case "started":
      console.log(`Repository watched: ${payload.repository.full_name}`);
      console.log(`By: ${payload.sender.login}`);
      console.log(`Total watchers: ${payload.repository.watchers_count}`);
      // Add your watch started logic here
      break;
    default:
      console.log(`Unhandled watch action: ${payload.action}`);
  }
};

const processForkEvent = async (payload: GitHubForkPayload): Promise<void> => {
  console.log(`Processing fork event`);
  console.log(`Forked repository: ${payload.forkee.full_name}`);
  console.log(`From: ${payload.repository.full_name}`);
  console.log(`By: ${payload.sender.login}`);
  console.log(`Total forks: ${payload.repository.forks_count}`);
  // Add your fork logic here
};

const processMemberEvent = async (
  payload: GitHubMemberPayload
): Promise<void> => {
  console.log(`Processing member event: ${payload.action}`);

  switch (payload.action) {
    case "added":
      console.log(`Member added: ${payload.member.login}`);
      console.log(`To repository: ${payload.repository.full_name}`);
      break;
    case "removed":
      console.log(`Member removed: ${payload.member.login}`);
      console.log(`From repository: ${payload.repository.full_name}`);
      break;
    case "edited":
      console.log(`Member edited: ${payload.member.login}`);
      if (payload.changes?.permission) {
        console.log(
          `Permission changed from ${payload.changes.permission.from} to ${payload.changes.permission.to}`
        );
      }
      break;
    default:
      console.log(`Unhandled member action: ${payload.action}`);
  }
};

const processDeploymentEvent = async (
  payload: GitHubDeploymentPayload
): Promise<void> => {
  console.log(`Processing deployment event: ${payload.action}`);

  switch (payload.action) {
    case "created":
      console.log(`Deployment created: ${payload.deployment.id}`);
      console.log(`Environment: ${payload.deployment.environment}`);
      console.log(`SHA: ${payload.deployment.sha}`);
      console.log(`Ref: ${payload.deployment.ref}`);
      break;
    default:
      console.log(`Unhandled deployment action: ${payload.action}`);
  }
};

const processDeploymentStatusEvent = async (
  payload: GitHubDeploymentStatusPayload
): Promise<void> => {
  console.log(`Processing deployment status event: ${payload.action}`);

  switch (payload.action) {
    case "created":
      console.log(`Deployment status created: ${payload.deployment_status.id}`);
      console.log(`State: ${payload.deployment_status.state}`);
      console.log(`Environment: ${payload.deployment_status.environment}`);
      console.log(`Description: ${payload.deployment_status.description}`);
      break;
    default:
      console.log(`Unhandled deployment status action: ${payload.action}`);
  }
};

const processPullRequestReviewEvent = async (
  payload: GitHubPullRequestReviewPayload
): Promise<void> => {
  console.log(`Processing pull request review event: ${payload.action}`);

  switch (payload.action) {
    case "submitted":
      console.log(`PR review submitted: ${payload.review.id}`);
      console.log(`State: ${payload.review.state}`);
      console.log(`PR #${payload.pull_request.number}`);
      console.log(`By: ${payload.review.user.login}`);
      break;
    case "edited":
      console.log(`PR review edited: ${payload.review.id}`);
      break;
    case "dismissed":
      console.log(`PR review dismissed: ${payload.review.id}`);
      break;
    default:
      console.log(`Unhandled PR review action: ${payload.action}`);
  }
};

const processPullRequestReviewCommentEvent = async (
  payload: GitHubPullRequestReviewCommentPayload
): Promise<void> => {
  console.log(
    `Processing pull request review comment event: ${payload.action}`
  );

  switch (payload.action) {
    case "created":
      console.log(`PR review comment created: ${payload.comment.id}`);
      console.log(`On PR #${payload.pull_request.number}`);
      console.log(`By: ${payload.comment.user.login}`);
      console.log(`File: ${payload.comment.path}`);
      console.log(`Line: ${payload.comment.position}`);
      break;
    case "edited":
      console.log(`PR review comment edited: ${payload.comment.id}`);
      break;
    case "deleted":
      console.log(`PR review comment deleted: ${payload.comment.id}`);
      break;
    default:
      console.log(`Unhandled PR review comment action: ${payload.action}`);
  }
};

const processIssueCommentEvent = async (
  payload: GitHubIssueCommentPayload
): Promise<void> => {
  console.log(`Processing issue comment event: ${payload.action}`);

  switch (payload.action) {
    case "created":
      console.log(`Issue comment created: ${payload.comment.id}`);
      console.log(`On issue #${payload.issue.number}`);
      console.log(`By: ${payload.comment.user.login}`);
      console.log(`Body: ${payload.comment.body.substring(0, 100)}...`);
      break;
    case "edited":
      console.log(`Issue comment edited: ${payload.comment.id}`);
      console.log(`On issue #${payload.issue.number}`);
      break;
    case "deleted":
      console.log(`Issue comment deleted: ${payload.comment.id}`);
      console.log(`On issue #${payload.issue.number}`);
      break;
    default:
      console.log(`Unhandled issue comment action: ${payload.action}`);
  }
};

const processCommitCommentEvent = async (
  payload: GitHubCommitCommentPayload
): Promise<void> => {
  console.log(`Processing commit comment event: ${payload.action}`);

  switch (payload.action) {
    case "created":
      console.log(`Commit comment created: ${payload.comment.id}`);
      console.log(`On commit: ${payload.comment.commit_id}`);
      console.log(`By: ${payload.comment.user.login}`);
      if (payload.comment.path) {
        console.log(`File: ${payload.comment.path}`);
        console.log(`Line: ${payload.comment.line}`);
      }
      console.log(`Body: ${payload.comment.body.substring(0, 100)}...`);
      break;
    default:
      console.log(`Unhandled commit comment action: ${payload.action}`);
  }
};

const processCreateEvent = async (
  payload: GitHubCreatePayload
): Promise<void> => {
  console.log(`Processing create event: ${payload.ref_type}`);
  console.log(`Created ${payload.ref_type}: ${payload.ref}`);
  console.log(`In repository: ${payload.repository.full_name}`);
  console.log(`By: ${payload.sender.login}`);

  switch (payload.ref_type) {
    case "branch":
      console.log(`New branch created: ${payload.ref}`);
      break;
    case "tag":
      console.log(`New tag created: ${payload.ref}`);
      break;
    default:
      console.log(`Unhandled create ref type: ${payload.ref_type}`);
  }
};

const processDeleteEvent = async (
  payload: GitHubDeletePayload
): Promise<void> => {
  console.log(`Processing delete event: ${payload.ref_type}`);
  console.log(`Deleted ${payload.ref_type}: ${payload.ref}`);
  console.log(`In repository: ${payload.repository.full_name}`);
  console.log(`By: ${payload.sender.login}`);

  switch (payload.ref_type) {
    case "branch":
      console.log(`Branch deleted: ${payload.ref}`);
      break;
    case "tag":
      console.log(`Tag deleted: ${payload.ref}`);
      break;
    default:
      console.log(`Unhandled delete ref type: ${payload.ref_type}`);
  }
};

const processStatusEvent = async (
  payload: GitHubStatusPayload
): Promise<void> => {
  console.log(`Processing status event`);
  console.log(`State: ${payload.state}`);
  console.log(`Context: ${payload.context}`);
  console.log(`Description: ${payload.description}`);
  console.log(`SHA: ${payload.sha}`);
  console.log(`Target URL: ${payload.target_url}`);

  switch (payload.state) {
    case "success":
      console.log(`Status check passed: ${payload.context}`);
      break;
    case "failure":
      console.log(`Status check failed: ${payload.context}`);
      break;
    case "error":
      console.log(`Status check error: ${payload.context}`);
      break;
    case "pending":
      console.log(`Status check pending: ${payload.context}`);
      break;
    default:
      console.log(`Unhandled status state: ${payload.state}`);
  }
};

const processDiscussionEvent = async (
  payload: GitHubDiscussionPayload
): Promise<void> => {
  console.log(`Processing discussion event: ${payload.action}`);

  switch (payload.action) {
    case "created":
      console.log(`Discussion created: #${payload.discussion.number}`);
      console.log(`Title: ${payload.discussion.title}`);
      console.log(`Category: ${payload.discussion.category.name}`);
      console.log(`By: ${payload.discussion.user.login}`);
      break;
    case "edited":
      console.log(`Discussion edited: #${payload.discussion.number}`);
      break;
    case "deleted":
      console.log(`Discussion deleted: #${payload.discussion.number}`);
      break;
    case "answered":
      console.log(`Discussion answered: #${payload.discussion.number}`);
      break;
    default:
      console.log(`Unhandled discussion action: ${payload.action}`);
  }
};

const processDiscussionCommentEvent = async (
  payload: GitHubDiscussionCommentPayload
): Promise<void> => {
  console.log(`Processing discussion comment event: ${payload.action}`);

  switch (payload.action) {
    case "created":
      console.log(`Discussion comment created: ${payload.comment.id}`);
      console.log(`On discussion #${payload.discussion.number}`);
      console.log(`By: ${payload.comment.user.login}`);
      console.log(`Body: ${payload.comment.body.substring(0, 100)}...`);
      break;
    case "edited":
      console.log(`Discussion comment edited: ${payload.comment.id}`);
      break;
    case "deleted":
      console.log(`Discussion comment deleted: ${payload.comment.id}`);
      break;
    default:
      console.log(`Unhandled discussion comment action: ${payload.action}`);
  }
};

const processPackageEvent = async (
  payload: GitHubPackagePayload
): Promise<void> => {
  console.log(`Processing package event: ${payload.action}`);

  switch (payload.action) {
    case "published":
      console.log(`Package published: ${payload.package.name}`);
      console.log(`Version: ${payload.package.package_version.version}`);
      console.log(`Type: ${payload.package.package_type}`);
      console.log(`By: ${payload.package.owner.login}`);
      break;
    case "updated":
      console.log(`Package updated: ${payload.package.name}`);
      console.log(`Version: ${payload.package.package_version.version}`);
      break;
    default:
      console.log(`Unhandled package action: ${payload.action}`);
  }
};

const processGollumEvent = async (
  payload: GitHubGollumPayload
): Promise<void> => {
  console.log(`Processing gollum event (wiki)`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(`Pages updated: ${payload.pages.length}`);

  for (const page of payload.pages) {
    console.log(`Page ${page.action}: ${page.title}`);
    console.log(`Page name: ${page.page_name}`);
    console.log(`SHA: ${page.sha}`);
    if (page.summary) {
      console.log(`Summary: ${page.summary}`);
    }
  }
};

const processAuditLogEvent = async (
  event: AuditLogEvent,
  organization: any
): Promise<void> => {
  console.log(
    `Processing audit event: ${event.action} by ${event.actor.login}`
  );

  switch (event.action) {
    case "repo.create":
      console.log(`Repository created: ${event.resource}`);
      break;
    case "repo.destroy":
      console.log(`Repository deleted: ${event.resource}`);
      break;
    case "team.create":
      console.log(`Team created: ${event.resource}`);
      break;
    case "org.invite_member":
      console.log(`Member invited to org: ${event.resource}`);
      break;
    case "user.login":
      console.log(`User login: ${event.actor.login}`);
      break;
    case "user.logout":
      console.log(`User logout: ${event.actor.login}`);
      break;
    default:
      console.log(`Unhandled audit event: ${event.action}`);
  }
};
