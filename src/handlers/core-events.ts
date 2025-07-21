import { Callback } from "aws-lambda";
import {
  processCreateEvent,
  processDeleteEvent,
  processPingEvent,
  processPushEvent,
  processRepositoryEvent,
} from "../processors";
import {
  GitHubCreatePayload,
  GitHubDeletePayload,
  GitHubPingPayload,
  GitHubPushPayload,
  GitHubRepositoryPayload,
  WebhookPayload,
} from "../types/webhook";
import { buildSuccessResponse } from "../utils/response-builder";

export const handleCoreEvents = async (
  eventType: string,
  payload: WebhookPayload,
  callback: Callback
) => {
  console.log(`🎯 Handling core event: ${eventType}`);

  switch (eventType) {
    case "ping":
      return await handlePingEvent(payload as GitHubPingPayload, callback);

    case "repository":
      return await handleRepositoryEvent(
        payload as GitHubRepositoryPayload,
        callback
      );

    case "push":
      return await handlePushEvent(payload as GitHubPushPayload, callback);

    case "create":
      return await handleCreateEvent(payload as GitHubCreatePayload, callback);

    case "delete":
      return await handleDeleteEvent(payload as GitHubDeletePayload, callback);

    default:
      return callback(
        null,
        buildSuccessResponse(`Unhandled core event: ${eventType}`)
      );
  }
};

const handlePingEvent = async (
  payload: GitHubPingPayload,
  callback: Callback
) => {
  console.log(`🏓 Ping event from webhook ID: ${payload.hook_id}`);
  await processPingEvent(payload);

  return callback(
    null,
    buildSuccessResponse("Ping event processed successfully", {
      hook_id: payload.hook_id,
      zen: payload.zen,
      repository: payload.repository?.full_name || "No repository",
    })
  );
};

const handleRepositoryEvent = async (
  payload: GitHubRepositoryPayload,
  callback: Callback
) => {
  console.log(
    `📁 Repository ${payload.action}: ${payload.repository.full_name}`
  );
  await processRepositoryEvent(payload);

  return callback(
    null,
    buildSuccessResponse(`Repository ${payload.action} event processed`, {
      repository: payload.repository.full_name,
      action: payload.action,
      private: payload.repository.private,
      default_branch: payload.repository.default_branch,
      language: payload.repository.language,
      stars: payload.repository.stargazers_count,
      forks: payload.repository.forks_count,
    })
  );
};

const handlePushEvent = async (
  payload: GitHubPushPayload,
  callback: Callback
) => {
  console.log(`📤 Push to ${payload.repository.full_name}: ${payload.ref}`);
  await processPushEvent(payload);

  return callback(
    null,
    buildSuccessResponse("Push event processed", {
      repository: payload.repository.full_name,
      ref: payload.ref,
      before: payload.before.substring(0, 7),
      after: payload.after.substring(0, 7),
      commits_count: payload.commits.length,
      pusher: payload.pusher.name,
      forced: payload.forced,
      created: payload.created,
      deleted: payload.deleted,
      distinct_commits: payload.commits.filter((c) => c.distinct).length,
    })
  );
};

const handleCreateEvent = async (
  payload: GitHubCreatePayload,
  callback: Callback
) => {
  console.log(`✨ Created ${payload.ref_type}: ${payload.ref}`);
  await processCreateEvent(payload);

  return callback(
    null,
    buildSuccessResponse(`Create ${payload.ref_type} event processed`, {
      repository: payload.repository.full_name,
      ref_type: payload.ref_type,
      ref: payload.ref,
      master_branch: payload.master_branch,
      description: payload.description,
      pusher_type: payload.pusher_type,
    })
  );
};

const handleDeleteEvent = async (
  payload: GitHubDeletePayload,
  callback: Callback
) => {
  console.log(`🗑️ Deleted ${payload.ref_type}: ${payload.ref}`);
  await processDeleteEvent(payload);

  return callback(
    null,
    buildSuccessResponse(`Delete ${payload.ref_type} event processed`, {
      repository: payload.repository.full_name,
      ref_type: payload.ref_type,
      ref: payload.ref,
      pusher_type: payload.pusher_type,
    })
  );
};
