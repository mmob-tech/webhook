import { Callback } from "aws-lambda";
import {
  processForkEvent,
  processStarEvent,
  processWatchEvent,
} from "../processors";
import {
  GitHubForkPayload,
  GitHubStarPayload,
  GitHubWatchPayload,
  WebhookPayload,
} from "../types/webhook";
import { buildSuccessResponse } from "../utils/response-builder";

export const handleSocialEvents = async (
  eventType: string,
  payload: WebhookPayload,
  callback: Callback
) => {
  console.log(`👥 Handling social event: ${eventType}`);

  switch (eventType) {
    case "star":
      return await handleStarEvent(payload as GitHubStarPayload, callback);

    case "watch":
      return await handleWatchEvent(payload as GitHubWatchPayload, callback);

    case "fork":
      return await handleForkEvent(payload as GitHubForkPayload, callback);

    default:
      return callback(
        null,
        buildSuccessResponse(`Unhandled social event: ${eventType}`)
      );
  }
};

const handleStarEvent = async (
  payload: GitHubStarPayload,
  callback: Callback
) => {
  console.log(`⭐ Star ${payload.action}: ${payload.repository.full_name}`);
  await processStarEvent(payload);

  return callback(
    null,
    buildSuccessResponse(`Star ${payload.action} event processed`, {
      repository: payload.repository.full_name,
      action: payload.action,
      starred_at: payload.starred_at,
      stargazer: payload.sender.login,
      total_stars: payload.repository.stargazers_count,
      repository_language: payload.repository.language,
      repository_topics: payload.repository.topics || [],
    })
  );
};

const handleWatchEvent = async (
  payload: GitHubWatchPayload,
  callback: Callback
) => {
  console.log(`👁️ Watch ${payload.action}: ${payload.repository.full_name}`);
  await processWatchEvent(payload);

  return callback(
    null,
    buildSuccessResponse(`Watch ${payload.action} event processed`, {
      repository: payload.repository.full_name,
      action: payload.action,
      watcher: payload.sender.login,
      total_watchers: payload.repository.watchers_count,
      total_stars: payload.repository.stargazers_count,
      total_forks: payload.repository.forks_count,
    })
  );
};

const handleForkEvent = async (
  payload: GitHubForkPayload,
  callback: Callback
) => {
  console.log(`🍴 Fork created: ${payload.forkee.full_name}`);
  await processForkEvent(payload);

  return callback(
    null,
    buildSuccessResponse("Fork event processed", {
      original_repository: payload.repository.full_name,
      forked_repository: payload.forkee.full_name,
      fork_owner: payload.sender.login,
      fork_private: payload.forkee.private,
      fork_created_at: payload.forkee.created_at,
      fork_default_branch: payload.forkee.default_branch,
      parent_stars: payload.repository.stargazers_count,
      parent_forks: payload.repository.forks_count,
      parent_watchers: payload.repository.watchers_count,
      is_nested_fork: payload.repository.fork,
    })
  );
};
