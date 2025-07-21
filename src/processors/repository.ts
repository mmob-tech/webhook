import {
  GitHubCreatePayload,
  GitHubDeletePayload,
  GitHubPingPayload,
  GitHubPushPayload,
  GitHubRepositoryPayload,
} from "../types/webhook";

export const processPingEvent = async (
  payload: GitHubPingPayload
): Promise<void> => {
  console.log(`🏓 Processing ping event`);
  console.log(`Zen message: ${payload.zen}`);
  console.log(`Hook ID: ${payload.hook_id}`);
  console.log(`Hook active: ${payload.hook.active}`);
  console.log(`Hook events: ${payload.hook.events.join(", ")}`);
  console.log(`Hook URL: ${payload.hook.config.url}`);

  if (payload.repository) {
    console.log(`Repository: ${payload.repository.full_name}`);
    console.log(`Repository owner: ${payload.repository.owner.login}`);
    console.log(`Repository private: ${payload.repository.private}`);
  }

  console.log(`✅ Ping event processed successfully`);
};

export const processRepositoryEvent = async (
  payload: GitHubRepositoryPayload
): Promise<void> => {
  console.log(`📁 Processing repository event: ${payload.action}`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(`Owner: ${payload.repository.owner.login}`);
  console.log(`Private: ${payload.repository.private}`);
  console.log(
    `Description: ${payload.repository.description || "No description"}`
  );
  console.log(`Language: ${payload.repository.language || "Not specified"}`);
  console.log(`Default branch: ${payload.repository.default_branch}`);
  console.log(`Stars: ${payload.repository.stargazers_count}`);
  console.log(`Forks: ${payload.repository.forks_count}`);
  console.log(`Open issues: ${payload.repository.open_issues_count}`);
  console.log(`Size: ${payload.repository.size} KB`);

  if (payload.repository.topics && payload.repository.topics.length > 0) {
    console.log(`Topics: ${payload.repository.topics.join(", ")}`);
  }

  if (payload.repository.license) {
    console.log(`License: ${payload.repository.license.name}`);
  }

  switch (payload.action) {
    case "created":
      console.log(`✨ Repository created`);
      console.log(`Created at: ${payload.repository.created_at}`);
      console.log(`Is template: ${payload.repository.is_template}`);
      break;
    case "deleted":
      console.log(`🗑️ Repository deleted`);
      break;
    case "archived":
      console.log(`📦 Repository archived`);
      break;
    case "unarchived":
      console.log(`📦 Repository unarchived`);
      break;
    case "edited":
      console.log(`✏️ Repository edited`);
      if (payload.changes) {
        console.log(`Changes: ${Object.keys(payload.changes).join(", ")}`);
      }
      break;
    case "renamed":
      console.log(`📝 Repository renamed`);
      if (payload.changes?.name) {
        console.log(`Old name: ${payload.changes.name.from}`);
        console.log(`New name: ${payload.repository.name}`);
      }
      break;
    case "transferred":
      console.log(`🔄 Repository transferred`);
      break;
    case "publicized":
      console.log(`🌍 Repository made public`);
      break;
    case "privatized":
      console.log(`🔒 Repository made private`);
      break;
    default:
      console.log(`❓ Unhandled repository action: ${payload.action}`);
  }
};

export const processPushEvent = async (
  payload: GitHubPushPayload
): Promise<void> => {
  console.log(`📤 Processing push event`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(`Ref: ${payload.ref}`);
  console.log(`Before: ${payload.before.substring(0, 7)}`);
  console.log(`After: ${payload.after.substring(0, 7)}`);
  console.log(`Pusher: ${payload.pusher.name} <${payload.pusher.email}>`);
  console.log(`Forced: ${payload.forced}`);
  console.log(`Created: ${payload.created}`);
  console.log(`Deleted: ${payload.deleted}`);
  console.log(`Compare: ${payload.compare}`);

  if (payload.commits && payload.commits.length > 0) {
    console.log(`📋 Commits (${payload.commits.length}):`);
    payload.commits.forEach((commit, index) => {
      console.log(
        `  ${index + 1}. ${commit.id.substring(0, 7)} - ${
          commit.message.split("\n")[0]
        }`
      );
      console.log(
        `     Author: ${commit.author.name} <${commit.author.email}>`
      );
      console.log(`     Timestamp: ${commit.timestamp}`);
      console.log(
        `     Added: ${commit.added.length}, Modified: ${commit.modified.length}, Removed: ${commit.removed.length}`
      );

      if (commit.added.length > 0) {
        console.log(`     Added files: ${commit.added.join(", ")}`);
      }
      if (commit.modified.length > 0) {
        console.log(`     Modified files: ${commit.modified.join(", ")}`);
      }
      if (commit.removed.length > 0) {
        console.log(`     Removed files: ${commit.removed.join(", ")}`);
      }
    });

    const distinctCommits = payload.commits.filter((c) => c.distinct);
    console.log(`Distinct commits: ${distinctCommits.length}`);
  }

  if (payload.head_commit) {
    console.log(`🔝 Head commit: ${payload.head_commit.id.substring(0, 7)}`);
    console.log(`Message: ${payload.head_commit.message.split("\n")[0]}`);
  }

  // Branch analysis
  const branch = payload.ref.replace("refs/heads/", "");
  console.log(`Branch: ${branch}`);

  if (branch === payload.repository.default_branch) {
    console.log(`🌟 Push to default branch`);
  }

  if (payload.created) {
    console.log(`✨ Branch created: ${branch}`);
  } else if (payload.deleted) {
    console.log(`🗑️ Branch deleted: ${branch}`);
  }
};

export const processCreateEvent = async (
  payload: GitHubCreatePayload
): Promise<void> => {
  console.log(`✨ Processing create event`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(`Ref type: ${payload.ref_type}`);
  console.log(`Ref: ${payload.ref}`);
  console.log(`Master branch: ${payload.master_branch}`);
  console.log(`Pusher type: ${payload.pusher_type}`);

  if (payload.description) {
    console.log(`Description: ${payload.description}`);
  }

  switch (payload.ref_type) {
    case "branch":
      console.log(`🌿 Branch created: ${payload.ref}`);
      break;
    case "tag":
      console.log(`🏷️ Tag created: ${payload.ref}`);
      break;
    case "repository":
      console.log(`📁 Repository created`);
      break;
    default:
      console.log(`❓ Unknown ref type: ${payload.ref_type}`);
  }
};

export const processDeleteEvent = async (
  payload: GitHubDeletePayload
): Promise<void> => {
  console.log(`🗑️ Processing delete event`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(`Ref type: ${payload.ref_type}`);
  console.log(`Ref: ${payload.ref}`);
  console.log(`Pusher type: ${payload.pusher_type}`);

  switch (payload.ref_type) {
    case "branch":
      console.log(`🌿 Branch deleted: ${payload.ref}`);
      break;
    case "tag":
      console.log(`🏷️ Tag deleted: ${payload.ref}`);
      break;
    default:
      console.log(`❓ Unknown ref type: ${payload.ref_type}`);
  }
};
