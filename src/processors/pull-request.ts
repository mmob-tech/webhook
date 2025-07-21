import {
  GitHubIssueCommentPayload,
  GitHubIssuesPayload,
  GitHubPullRequestPayload,
  GitHubPullRequestReviewCommentPayload,
  GitHubPullRequestReviewPayload,
} from "../types/webhook";

export const processPullRequestEvent = async (
  payload: GitHubPullRequestPayload
): Promise<void> => {
  console.log(`🔄 Processing pull request event: ${payload.action}`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(
    `PR #${payload.pull_request.number}: ${payload.pull_request.title}`
  );
  console.log(`Author: ${payload.pull_request.user.login}`);
  console.log(`State: ${payload.pull_request.state}`);
  console.log(`Draft: ${payload.pull_request.draft}`);
  console.log(`Merged: ${payload.pull_request.merged}`);
  console.log(
    `Head: ${
      payload.pull_request.head.ref
    } (${payload.pull_request.head.sha.substring(0, 7)})`
  );
  console.log(
    `Base: ${
      payload.pull_request.base.ref
    } (${payload.pull_request.base.sha.substring(0, 7)})`
  );
  console.log(`Commits: ${payload.pull_request.commits}`);
  console.log(`Additions: ${payload.pull_request.additions}`);
  console.log(`Deletions: ${payload.pull_request.deletions}`);
  console.log(`Changed files: ${payload.pull_request.changed_files}`);
  console.log(`Comments: ${payload.pull_request.comments}`);
  console.log(`Review comments: ${payload.pull_request.review_comments}`);
  console.log(`Mergeable: ${payload.pull_request.mergeable}`);
  console.log(`Mergeable state: ${payload.pull_request.mergeable_state}`);

  if (
    payload.pull_request.assignees &&
    payload.pull_request.assignees.length > 0
  ) {
    console.log(
      `👥 Assignees: ${payload.pull_request.assignees
        .map((a) => a.login)
        .join(", ")}`
    );
  }

  if (
    payload.pull_request.requested_reviewers &&
    payload.pull_request.requested_reviewers.length > 0
  ) {
    console.log(
      `👀 Requested reviewers: ${payload.pull_request.requested_reviewers
        .map((r) => r.login)
        .join(", ")}`
    );
  }

  if (payload.pull_request.labels && payload.pull_request.labels.length > 0) {
    console.log(
      `🏷️ Labels: ${payload.pull_request.labels.map((l) => l.name).join(", ")}`
    );
  }

  if (payload.pull_request.milestone) {
    console.log(`🎯 Milestone: ${payload.pull_request.milestone.title}`);
  }

  switch (payload.action) {
    case "opened":
      console.log(`✨ Pull request opened`);
      console.log(`Created at: ${payload.pull_request.created_at}`);
      break;
    case "closed":
      console.log(`🔒 Pull request closed`);
      if (payload.pull_request.merged) {
        console.log(`🎉 Pull request was merged!`);
        console.log(`Merged at: ${payload.pull_request.merged_at}`);
        console.log(
          `Merged by: ${payload.pull_request.merged_by?.login || "Unknown"}`
        );
      } else {
        console.log(`❌ Pull request was closed without merging`);
      }
      break;
    case "reopened":
      console.log(`🔓 Pull request reopened`);
      break;
    case "edited":
      console.log(`✏️ Pull request edited`);
      if (payload.changes) {
        console.log(`Changes: ${Object.keys(payload.changes).join(", ")}`);
      }
      break;
    case "assigned":
      console.log(`👤 Pull request assigned`);
      if (payload.assignee) {
        console.log(`Assigned to: ${payload.assignee.login}`);
      }
      break;
    case "unassigned":
      console.log(`👤 Pull request unassigned`);
      if (payload.assignee) {
        console.log(`Unassigned from: ${payload.assignee.login}`);
      }
      break;
    case "labeled":
      console.log(`🏷️ Label added`);
      if (payload.label) {
        console.log(`Label: ${payload.label.name}`);
      }
      break;
    case "unlabeled":
      console.log(`🏷️ Label removed`);
      if (payload.label) {
        console.log(`Label: ${payload.label.name}`);
      }
      break;
    case "synchronize":
      console.log(`🔄 Pull request synchronized (new commits)`);
      break;
    case "ready_for_review":
      console.log(`✅ Pull request ready for review (no longer draft)`);
      break;
    case "converted_to_draft":
      console.log(`📝 Pull request converted to draft`);
      break;
    case "review_requested":
      console.log(`👀 Review requested`);
      if (payload.requested_reviewer) {
        console.log(`Reviewer: ${payload.requested_reviewer.login}`);
      }
      break;
    case "review_request_removed":
      console.log(`👀 Review request removed`);
      if (payload.requested_reviewer) {
        console.log(`Reviewer: ${payload.requested_reviewer.login}`);
      }
      break;
    default:
      console.log(`❓ Unhandled pull request action: ${payload.action}`);
  }
};

export const processPullRequestReviewEvent = async (
  payload: GitHubPullRequestReviewPayload
): Promise<void> => {
  console.log(`📝 Processing pull request review event: ${payload.action}`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(
    `PR #${payload.pull_request.number}: ${payload.pull_request.title}`
  );
  console.log(`Review ID: ${payload.review.id}`);
  console.log(`Reviewer: ${payload.review.user.login}`);
  console.log(`Review state: ${payload.review.state}`);
  console.log(`Commit ID: ${payload.review.commit_id.substring(0, 7)}`);
  console.log(`Submitted at: ${payload.review.submitted_at}`);

  if (payload.review.body) {
    console.log(
      `Review body: ${payload.review.body.substring(0, 100)}${
        payload.review.body.length > 100 ? "..." : ""
      }`
    );
  }

  switch (payload.action) {
    case "submitted":
      console.log(`✨ Review submitted`);
      switch (payload.review.state) {
        case "approved":
          console.log(`✅ Review approved the changes`);
          break;
        case "changes_requested":
          console.log(`🔄 Review requested changes`);
          break;
        case "commented":
          console.log(`💬 Review left comments`);
          break;
        case "dismissed":
          console.log(`❌ Review was dismissed`);
          break;
        default:
          console.log(`❓ Unknown review state: ${payload.review.state}`);
      }
      break;
    case "edited":
      console.log(`✏️ Review edited`);
      if (payload.changes) {
        console.log(`Changes: ${Object.keys(payload.changes).join(", ")}`);
      }
      break;
    case "dismissed":
      console.log(`❌ Review dismissed`);
      break;
    default:
      console.log(`❓ Unhandled review action: ${payload.action}`);
  }
};

export const processPullRequestReviewCommentEvent = async (
  payload: GitHubPullRequestReviewCommentPayload
): Promise<void> => {
  console.log(
    `💬 Processing pull request review comment event: ${payload.action}`
  );
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(
    `PR #${payload.pull_request.number}: ${payload.pull_request.title}`
  );
  console.log(`Comment ID: ${payload.comment.id}`);
  console.log(`Author: ${payload.comment.user.login}`);
  console.log(`File: ${payload.comment.path}`);
  console.log(
    `Line: ${payload.comment.line || payload.comment.original_line || "N/A"}`
  );
  console.log(
    `Position: ${
      payload.comment.position || payload.comment.original_position || "N/A"
    }`
  );
  console.log(`Commit: ${payload.comment.commit_id.substring(0, 7)}`);
  console.log(`Created at: ${payload.comment.created_at}`);

  if (payload.comment.body) {
    console.log(
      `Comment: ${payload.comment.body.substring(0, 100)}${
        payload.comment.body.length > 100 ? "..." : ""
      }`
    );
  }

  if (payload.comment.in_reply_to_id) {
    console.log(`In reply to comment: ${payload.comment.in_reply_to_id}`);
  }

  switch (payload.action) {
    case "created":
      console.log(`✨ Review comment created`);
      break;
    case "edited":
      console.log(`✏️ Review comment edited`);
      if (payload.changes) {
        console.log(`Changes: ${Object.keys(payload.changes).join(", ")}`);
      }
      break;
    case "deleted":
      console.log(`🗑️ Review comment deleted`);
      break;
    default:
      console.log(`❓ Unhandled review comment action: ${payload.action}`);
  }
};

export const processIssuesEvent = async (
  payload: GitHubIssuesPayload
): Promise<void> => {
  console.log(`🐛 Processing issues event: ${payload.action}`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(`Issue #${payload.issue.number}: ${payload.issue.title}`);
  console.log(`Author: ${payload.issue.user.login}`);
  console.log(`State: ${payload.issue.state}`);
  console.log(`Comments: ${payload.issue.comments}`);
  console.log(`Created at: ${payload.issue.created_at}`);
  console.log(`Updated at: ${payload.issue.updated_at}`);

  if (payload.issue.assignees && payload.issue.assignees.length > 0) {
    console.log(
      `👥 Assignees: ${payload.issue.assignees.map((a) => a.login).join(", ")}`
    );
  }

  if (payload.issue.labels && payload.issue.labels.length > 0) {
    console.log(
      `🏷️ Labels: ${payload.issue.labels.map((l) => l.name).join(", ")}`
    );
  }

  if (payload.issue.milestone) {
    console.log(`🎯 Milestone: ${payload.issue.milestone.title}`);
  }

  if (payload.issue.body) {
    console.log(
      `Body: ${payload.issue.body.substring(0, 150)}${
        payload.issue.body.length > 150 ? "..." : ""
      }`
    );
  }

  switch (payload.action) {
    case "opened":
      console.log(`✨ Issue opened`);
      break;
    case "closed":
      console.log(`🔒 Issue closed`);
      if (payload.issue.closed_at) {
        console.log(`Closed at: ${payload.issue.closed_at}`);
      }
      if (payload.issue.state_reason) {
        console.log(`Reason: ${payload.issue.state_reason}`);
      }
      break;
    case "reopened":
      console.log(`🔓 Issue reopened`);
      break;
    case "edited":
      console.log(`✏️ Issue edited`);
      if (payload.changes) {
        console.log(`Changes: ${Object.keys(payload.changes).join(", ")}`);
      }
      break;
    case "assigned":
      console.log(`👤 Issue assigned`);
      if (payload.assignee) {
        console.log(`Assigned to: ${payload.assignee.login}`);
      }
      break;
    case "unassigned":
      console.log(`👤 Issue unassigned`);
      if (payload.assignee) {
        console.log(`Unassigned from: ${payload.assignee.login}`);
      }
      break;
    case "labeled":
      console.log(`🏷️ Label added`);
      if (payload.label) {
        console.log(`Label: ${payload.label.name}`);
      }
      break;
    case "unlabeled":
      console.log(`🏷️ Label removed`);
      if (payload.label) {
        console.log(`Label: ${payload.label.name}`);
      }
      break;
    case "locked":
      console.log(`🔒 Issue locked`);
      break;
    case "unlocked":
      console.log(`🔓 Issue unlocked`);
      break;
    default:
      console.log(`❓ Unhandled issues action: ${payload.action}`);
  }
};

export const processIssueCommentEvent = async (
  payload: GitHubIssueCommentPayload
): Promise<void> => {
  console.log(`💬 Processing issue comment event: ${payload.action}`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(`Issue #${payload.issue.number}: ${payload.issue.title}`);
  console.log(`Comment ID: ${payload.comment.id}`);
  console.log(`Author: ${payload.comment.user.login}`);
  console.log(`Author association: ${payload.comment.author_association}`);
  console.log(`Created at: ${payload.comment.created_at}`);
  console.log(`Updated at: ${payload.comment.updated_at}`);

  if (payload.comment.body) {
    console.log(
      `Comment: ${payload.comment.body.substring(0, 200)}${
        payload.comment.body.length > 200 ? "..." : ""
      }`
    );
  }

  // Check if it's a PR comment (issues API includes PR comments)
  if (payload.issue.pull_request) {
    console.log(`🔄 This is a comment on a Pull Request`);
    console.log(`PR URL: ${payload.issue.pull_request.html_url}`);
  }

  switch (payload.action) {
    case "created":
      console.log(`✨ Issue comment created`);
      break;
    case "edited":
      console.log(`✏️ Issue comment edited`);
      if (payload.changes) {
        console.log(`Changes: ${Object.keys(payload.changes).join(", ")}`);
      }
      break;
    case "deleted":
      console.log(`🗑️ Issue comment deleted`);
      break;
    default:
      console.log(`❓ Unhandled issue comment action: ${payload.action}`);
  }
};
