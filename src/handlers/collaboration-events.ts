import { Callback } from "aws-lambda";
import {
  processIssueCommentEvent,
  processIssuesEvent,
  processPullRequestEvent,
  processPullRequestReviewCommentEvent,
  processPullRequestReviewEvent,
} from "../processors";
import {
  GitHubIssueCommentPayload,
  GitHubIssuesPayload,
  GitHubPullRequestPayload,
  GitHubPullRequestReviewCommentPayload,
  GitHubPullRequestReviewPayload,
  WebhookPayload,
} from "../types/webhook";
import { buildSuccessResponse } from "../utils/response-builder";

export const handleCollaborationEvents = async (
  eventType: string,
  payload: WebhookPayload,
  callback: Callback
) => {
  console.log(`🤝 Handling collaboration event: ${eventType}`);

  switch (eventType) {
    case "pull_request":
      return await handlePullRequestEvent(
        payload as GitHubPullRequestPayload,
        callback
      );

    case "pull_request_review":
      return await handlePullRequestReviewEvent(
        payload as GitHubPullRequestReviewPayload,
        callback
      );

    case "pull_request_review_comment":
      return await handlePullRequestReviewCommentEvent(
        payload as GitHubPullRequestReviewCommentPayload,
        callback
      );

    case "issues":
      return await handleIssuesEvent(payload as GitHubIssuesPayload, callback);

    case "issue_comment":
      return await handleIssueCommentEvent(
        payload as GitHubIssueCommentPayload,
        callback
      );

    default:
      return callback(
        null,
        buildSuccessResponse(`Unhandled collaboration event: ${eventType}`)
      );
  }
};

const handlePullRequestEvent = async (
  payload: GitHubPullRequestPayload,
  callback: Callback
) => {
  console.log(
    `🔄 Pull request ${payload.action}: PR #${payload.pull_request.number}`
  );
  await processPullRequestEvent(payload);

  return callback(
    null,
    buildSuccessResponse(`Pull request ${payload.action} event processed`, {
      repository: payload.repository.full_name,
      pull_request_number: payload.pull_request.number,
      pull_request_title: payload.pull_request.title,
      action: payload.action,
      state: payload.pull_request.state,
      draft: payload.pull_request.draft,
      merged: payload.pull_request.merged,
      author: payload.pull_request.user.login,
      head_ref: payload.pull_request.head.ref,
      base_ref: payload.pull_request.base.ref,
      commits: payload.pull_request.commits,
      additions: payload.pull_request.additions,
      deletions: payload.pull_request.deletions,
      changed_files: payload.pull_request.changed_files,
    })
  );
};

const handlePullRequestReviewEvent = async (
  payload: GitHubPullRequestReviewPayload,
  callback: Callback
) => {
  console.log(`📝 PR review ${payload.action}: Review ${payload.review.id}`);
  await processPullRequestReviewEvent(payload);

  return callback(
    null,
    buildSuccessResponse(
      `Pull request review ${payload.action} event processed`,
      {
        repository: payload.repository.full_name,
        pull_request_number: payload.pull_request.number,
        review_id: payload.review.id,
        reviewer: payload.review.user.login,
        review_state: payload.review.state,
        action: payload.action,
      }
    )
  );
};

const handlePullRequestReviewCommentEvent = async (
  payload: GitHubPullRequestReviewCommentPayload,
  callback: Callback
) => {
  console.log(
    `💬 PR review comment ${payload.action}: Comment ${payload.comment.id}`
  );
  await processPullRequestReviewCommentEvent(payload);

  return callback(
    null,
    buildSuccessResponse(
      `Pull request review comment ${payload.action} event processed`,
      {
        repository: payload.repository.full_name,
        pull_request_number: payload.pull_request.number,
        comment_id: payload.comment.id,
        author: payload.comment.user.login,
        file: payload.comment.path,
        line: payload.comment.line,
        action: payload.action,
      }
    )
  );
};

const handleIssuesEvent = async (
  payload: GitHubIssuesPayload,
  callback: Callback
) => {
  console.log(`🐛 Issue ${payload.action}: Issue #${payload.issue.number}`);
  await processIssuesEvent(payload);

  return callback(
    null,
    buildSuccessResponse(`Issue ${payload.action} event processed`, {
      repository: payload.repository.full_name,
      issue_number: payload.issue.number,
      issue_title: payload.issue.title,
      action: payload.action,
      state: payload.issue.state,
      author: payload.issue.user.login,
      assignees: payload.issue.assignees?.map((a) => a.login) || [],
      labels: payload.issue.labels?.map((l) => l.name) || [],
      milestone: payload.issue.milestone?.title || null,
    })
  );
};

const handleIssueCommentEvent = async (
  payload: GitHubIssueCommentPayload,
  callback: Callback
) => {
  console.log(
    `💬 Issue comment ${payload.action}: Comment ${payload.comment.id}`
  );
  await processIssueCommentEvent(payload);

  return callback(
    null,
    buildSuccessResponse(`Issue comment ${payload.action} event processed`, {
      repository: payload.repository.full_name,
      issue_number: payload.issue.number,
      comment_id: payload.comment.id,
      author: payload.comment.user.login,
      author_association: payload.comment.author_association,
      action: payload.action,
    })
  );
};
