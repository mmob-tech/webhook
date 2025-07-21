import {
  GitHubForkPayload,
  GitHubStarPayload,
  GitHubWatchPayload,
} from "../types/webhook";

export const processStarEvent = async (
  payload: GitHubStarPayload
): Promise<void> => {
  console.log(`⭐ Processing star event: ${payload.action}`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(`User: ${payload.sender.login}`);

  switch (payload.action) {
    case "created":
      console.log(`✨ Repository starred`);
      console.log(`Starred at: ${payload.starred_at}`);
      console.log(`Total stars: ${payload.repository.stargazers_count}`);
      break;
    case "deleted":
      console.log(`💔 Repository unstarred`);
      console.log(`Total stars: ${payload.repository.stargazers_count}`);
      break;
    default:
      console.log(`❓ Unhandled star action: ${payload.action}`);
  }
};

export const processWatchEvent = async (
  payload: GitHubWatchPayload
): Promise<void> => {
  console.log(`👁️ Processing watch event: ${payload.action}`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(`Watcher: ${payload.sender.login}`);
  console.log(`Total watchers: ${payload.repository.watchers_count}`);
  console.log(`Total stars: ${payload.repository.stargazers_count}`);

  switch (payload.action) {
    case "started":
      console.log(`⭐ Repository starred (watched)`);
      break;
    default:
      console.log(`❓ Unhandled watch action: ${payload.action}`);
  }
};

export const processForkEvent = async (
  payload: GitHubForkPayload
): Promise<void> => {
  console.log(`🍴 Processing fork event`);
  console.log(`Forked to: ${payload.forkee.full_name}`);
  console.log(`From: ${payload.repository.full_name}`);
  console.log(`Forked by: ${payload.sender.login}`);
  console.log(`Fork is private: ${payload.forkee.private}`);
  console.log(`Total forks: ${payload.repository.forks_count}`);
  console.log(`Fork URL: ${payload.forkee.html_url}`);
  console.log(`Clone URL: ${payload.forkee.clone_url}`);

  if (payload.forkee.description) {
    console.log(`Fork description: ${payload.forkee.description}`);
  }

  // Log fork statistics
  console.log(`📊 Fork Statistics:`);
  console.log(
    `  - Parent repository stars: ${payload.repository.stargazers_count}`
  );
  console.log(`  - Parent repository forks: ${payload.repository.forks_count}`);
  console.log(
    `  - Parent repository watchers: ${payload.repository.watchers_count}`
  );
  console.log(`  - Fork created at: ${payload.forkee.created_at}`);
  console.log(`  - Fork default branch: ${payload.forkee.default_branch}`);

  // Check if it's a fork of a fork
  if (payload.repository.fork) {
    console.log(`🔄 This is a fork of a fork (nested fork)`);
  }
};
