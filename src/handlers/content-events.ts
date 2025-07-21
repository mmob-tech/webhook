import { Callback } from "aws-lambda";
import {
  processCommitCommentEvent,
  processDiscussionCommentEvent,
  processDiscussionEvent,
  processGollumEvent,
  processPackageEvent,
  processReleaseEvent,
} from "../processors";
import {
  GitHubCommitCommentPayload,
  GitHubDiscussionCommentPayload,
  GitHubDiscussionPayload,
  GitHubGollumPayload,
  GitHubPackagePayload,
  GitHubReleasePayload,
  WebhookPayload,
} from "../types/webhook";
import { buildSuccessResponse } from "../utils/response-builder";

export const handleContentEvents = async (
  eventType: string,
  payload: WebhookPayload,
  callback: Callback
) => {
  console.log(`📝 Handling content event: ${eventType}`);

  switch (eventType) {
    case "release":
      return await handleReleaseEvent(
        payload as GitHubReleasePayload,
        callback
      );

    case "discussion":
      return await handleDiscussionEvent(
        payload as GitHubDiscussionPayload,
        callback
      );

    case "discussion_comment":
      return await handleDiscussionCommentEvent(
        payload as GitHubDiscussionCommentPayload,
        callback
      );

    case "package":
      return await handlePackageEvent(
        payload as GitHubPackagePayload,
        callback
      );

    case "gollum":
      return await handleGollumEvent(payload as GitHubGollumPayload, callback);

    case "commit_comment":
      return await handleCommitCommentEvent(
        payload as GitHubCommitCommentPayload,
        callback
      );

    default:
      return callback(
        null,
        buildSuccessResponse(`Unhandled content event: ${eventType}`)
      );
  }
};

const handleReleaseEvent = async (
  payload: GitHubReleasePayload,
  callback: Callback
) => {
  console.log(`🚀 Release ${payload.action}: ${payload.release.tag_name}`);
  await processReleaseEvent(payload);

  return callback(
    null,
    buildSuccessResponse(`Release ${payload.action} event processed`, {
      repository: payload.repository.full_name,
      release_name: payload.release.name || payload.release.tag_name,
      tag_name: payload.release.tag_name,
      release_id: payload.release.id,
      action: payload.action,
      author: payload.release.author.login,
      draft: payload.release.draft,
      prerelease: payload.release.prerelease,
      created_at: payload.release.created_at,
      published_at: payload.release.published_at,
      assets_count: payload.release.assets?.length || 0,
      target_commitish: payload.release.target_commitish,
      ...(payload.changes && {
        changes: Object.keys(payload.changes),
      }),
    })
  );
};

const handleDiscussionEvent = async (
  payload: GitHubDiscussionPayload,
  callback: Callback
) => {
  console.log(`💬 Discussion ${payload.action}: #${payload.discussion.number}`);
  await processDiscussionEvent(payload);

  return callback(
    null,
    buildSuccessResponse(`Discussion ${payload.action} event processed`, {
      repository: payload.repository.full_name,
      discussion_number: payload.discussion.number,
      discussion_title: payload.discussion.title,
      discussion_id: payload.discussion.id,
      action: payload.action,
      author: payload.discussion.user.login,
      category: payload.discussion.category.name,
      state: payload.discussion.state,
      locked: payload.discussion.locked,
      comments_count: payload.discussion.comments,
      labels: payload.discussion.labels?.map((l) => l.name) || [],
      answered: !!payload.discussion.answer_chosen_at,
      answer_chosen_by: payload.discussion.answer_chosen_by?.login || null,
      ...(payload.changes && {
        changes: Object.keys(payload.changes),
      }),
      ...(payload.label && {
        affected_label: payload.label.name,
      }),
    })
  );
};

const handleDiscussionCommentEvent = async (
  payload: GitHubDiscussionCommentPayload,
  callback: Callback
) => {
  console.log(
    `💬 Discussion comment ${payload.action}: Comment ${payload.comment.id}`
  );
  await processDiscussionCommentEvent(payload);

  return callback(
    null,
    buildSuccessResponse(
      `Discussion comment ${payload.action} event processed`,
      {
        repository: payload.repository.full_name,
        discussion_number: payload.discussion.number,
        discussion_title: payload.discussion.title,
        comment_id: payload.comment.id,
        author: payload.comment.user.login,
        author_association: payload.comment.author_association,
        action: payload.action,
        parent_id: payload.comment.parent_id,
        child_comment_count: payload.comment.child_comment_count,
        ...(payload.changes && {
          changes: Object.keys(payload.changes),
        }),
      }
    )
  );
};

const handlePackageEvent = async (
  payload: GitHubPackagePayload,
  callback: Callback
) => {
  console.log(`📦 Package ${payload.action}: ${payload.package.name}`);
  await processPackageEvent(payload);

  return callback(
    null,
    buildSuccessResponse(`Package ${payload.action} event processed`, {
      package_name: payload.package.name,
      package_id: payload.package.id,
      ecosystem: payload.package.ecosystem,
      package_type: payload.package.package_type,
      action: payload.action,
      visibility: payload.package.visibility,
      owner: payload.package.owner.login,
      owner_type: payload.package.owner.type,
      version: payload.package.package_version?.version || null,
      version_id: payload.package.package_version?.id || null,
      registry: payload.package.registry?.name || null,
      ...(payload.repository && {
        repository: payload.repository.full_name,
      }),
    })
  );
};

const handleGollumEvent = async (
  payload: GitHubGollumPayload,
  callback: Callback
) => {
  console.log(`📚 Gollum (wiki) event: ${payload.pages?.length || 0} pages`);
  await processGollumEvent(payload);

  return callback(
    null,
    buildSuccessResponse("Gollum (wiki) event processed", {
      repository: payload.repository.full_name,
      pages_count: payload.pages?.length || 0,
      modified_by: payload.sender.login,
      pages:
        payload.pages?.map((page) => ({
          page_name: page.page_name,
          title: page.title,
          action: page.action,
          sha: page.sha.substring(0, 7),
        })) || [],
    })
  );
};

const handleCommitCommentEvent = async (
  payload: GitHubCommitCommentPayload,
  callback: Callback
) => {
  console.log(
    `💬 Commit comment ${payload.action}: Comment ${payload.comment.id}`
  );
  await processCommitCommentEvent(payload);

  return callback(
    null,
    buildSuccessResponse(`Commit comment ${payload.action} event processed`, {
      repository: payload.repository.full_name,
      comment_id: payload.comment.id,
      commit_id: payload.comment.commit_id,
      commit_sha: payload.comment.commit_id.substring(0, 7),
      author: payload.comment.user.login,
      author_association: payload.comment.author_association,
      action: payload.action,
      file_path: payload.comment.path,
      line: payload.comment.line,
      position: payload.comment.position,
    })
  );
};
