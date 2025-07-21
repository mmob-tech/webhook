import {
  GitHubCommitCommentPayload,
  GitHubDeploymentPayload,
  GitHubDeploymentStatusPayload,
  GitHubDiscussionCommentPayload,
  GitHubDiscussionPayload,
  GitHubGollumPayload,
  GitHubMemberPayload,
  GitHubOrganizationPayload,
  GitHubPackagePayload,
  GitHubReleasePayload,
  GitHubTeamPayload,
} from "../types/webhook";

// =============================================================================
// ORGANIZATION EVENTS
// =============================================================================

export const processOrganizationEvent = async (
  payload: GitHubOrganizationPayload
): Promise<void> => {
  console.log(`🏢 Processing organization event: ${payload.action}`);

  const org = payload.organization;
  console.log(`Organization: ${org.login}`);
  console.log(`Organization ID: ${org.id}`);
  console.log(`Public repos: ${org.public_repos}`);
  console.log(`Total private repos: ${org.total_private_repos || "N/A"}`);
  console.log(`Public members: ${org.public_members_count || "N/A"}`);

  switch (payload.action) {
    case "deleted":
      console.log(`🗑️ Organization deleted`);
      break;
    case "renamed":
      console.log(`📝 Organization renamed`);
      if (payload.changes?.login) {
        console.log(`Old name: ${payload.changes.login.from}`);
        console.log(`New name: ${org.login}`);
      }
      break;
    case "member_added":
      console.log(`👤 Member added to organization`);
      if (payload.membership) {
        console.log(`User: ${payload.membership.user.login}`);
        console.log(`Role: ${payload.membership.role}`);
        console.log(`State: ${payload.membership.state}`);
      }
      break;
    case "member_removed":
      console.log(`👤 Member removed from organization`);
      if (payload.membership) {
        console.log(`User: ${payload.membership.user.login}`);
      }
      break;
    case "member_invited":
      console.log(`📧 Member invited to organization`);
      if (payload.invitation) {
        console.log(
          `Invitee: ${payload.invitation.login || payload.invitation.email}`
        );
        console.log(`Role: ${payload.invitation.role}`);
        console.log(`Team count: ${payload.invitation.team_count}`);
        console.log(`Inviter: ${payload.invitation.inviter.login}`);
      }
      break;
    default:
      console.log(`❓ Unhandled organization action: ${payload.action}`);
  }
};

// =============================================================================
// TEAM EVENTS
// =============================================================================

export const processTeamEvent = async (
  payload: GitHubTeamPayload
): Promise<void> => {
  console.log(`👥 Processing team event: ${payload.action}`);

  const team = payload.team;
  console.log(`Team: ${team.name}`);
  console.log(`Team ID: ${team.id}`);
  console.log(`Team slug: ${team.slug}`);
  console.log(`Organization: ${payload.organization.login}`);
  console.log(`Privacy: ${team.privacy}`);
  console.log(`Permission: ${team.permission}`);
  console.log(`Members count: ${team.members_count || "N/A"}`);
  console.log(`Repos count: ${team.repos_count || "N/A"}`);

  if (team.description) {
    console.log(`Description: ${team.description}`);
  }

  if (team.parent) {
    console.log(`Parent team: ${team.parent.name}`);
  }

  switch (payload.action) {
    case "created":
      console.log(`✨ Team created`);
      break;
    case "deleted":
      console.log(`🗑️ Team deleted`);
      break;
    case "edited":
      console.log(`✏️ Team edited`);
      if (payload.changes) {
        console.log(`Changes: ${Object.keys(payload.changes).join(", ")}`);
      }
      break;
    case "added_to_repository":
      console.log(`📁 Team added to repository`);
      if (payload.repository) {
        console.log(`Repository: ${payload.repository.full_name}`);
      }
      break;
    case "removed_from_repository":
      console.log(`📁 Team removed from repository`);
      if (payload.repository) {
        console.log(`Repository: ${payload.repository.full_name}`);
      }
      break;
    default:
      console.log(`❓ Unhandled team action: ${payload.action}`);
  }
};

// =============================================================================
// MEMBER EVENTS
// =============================================================================

export const processMemberEvent = async (
  payload: GitHubMemberPayload
): Promise<void> => {
  console.log(`👤 Processing member event: ${payload.action}`);

  const member = payload.member;
  console.log(`Member: ${member.login}`);
  console.log(`Member ID: ${member.id}`);
  console.log(`Member type: ${member.type}`);
  console.log(`Site admin: ${member.site_admin}`);
  console.log(`Repository: ${payload.repository.full_name}`);

  switch (payload.action) {
    case "added":
      console.log(`✨ Collaborator added`);
      break;
    case "removed":
      console.log(`🗑️ Collaborator removed`);
      break;
    case "edited":
      console.log(`✏️ Collaborator permissions edited`);
      if (payload.changes?.permission) {
        console.log(`Old permission: ${payload.changes.permission.from}`);
        console.log(`New permission: ${payload.changes.permission.to}`);
      }
      break;
    default:
      console.log(`❓ Unhandled member action: ${payload.action}`);
  }
};

// =============================================================================
// DEPLOYMENT EVENTS
// =============================================================================

export const processDeploymentEvent = async (
  payload: GitHubDeploymentPayload
): Promise<void> => {
  console.log(`🚀 Processing deployment event`);

  const deployment = payload.deployment;
  console.log(`Deployment ID: ${deployment.id}`);
  console.log(`Environment: ${deployment.environment}`);
  console.log(`Ref: ${deployment.ref}`);
  console.log(`SHA: ${deployment.sha.substring(0, 7)}`);
  console.log(`Task: ${deployment.task}`);
  console.log(`Creator: ${deployment.creator.login}`);
  console.log(`Auto merge: ${deployment.auto_merge || false}`);
  console.log(`Production environment: ${deployment.production_environment}`);
  console.log(`Transient environment: ${deployment.transient_environment}`);
  console.log(`Created at: ${deployment.created_at}`);

  if (deployment.description) {
    console.log(`Description: ${deployment.description}`);
  }

  if (deployment.required_contexts && deployment.required_contexts.length > 0) {
    console.log(
      `Required contexts: ${deployment.required_contexts.join(", ")}`
    );
  }

  console.log(`✨ Deployment created`);
};

export const processDeploymentStatusEvent = async (
  payload: GitHubDeploymentStatusPayload
): Promise<void> => {
  console.log(`📊 Processing deployment status event: ${payload.action}`);

  const deploymentStatus = payload.deployment_status;
  console.log(`Status ID: ${deploymentStatus.id}`);
  console.log(`Deployment ID: ${payload.deployment.id}`);
  console.log(`State: ${deploymentStatus.state}`);
  console.log(`Environment: ${deploymentStatus.environment}`);
  console.log(`Creator: ${deploymentStatus.creator.login}`);
  console.log(`Created at: ${deploymentStatus.created_at}`);

  if (deploymentStatus.description) {
    console.log(`Description: ${deploymentStatus.description}`);
  }

  if (deploymentStatus.target_url) {
    console.log(`Target URL: ${deploymentStatus.target_url}`);
  }

  if (deploymentStatus.log_url) {
    console.log(`Log URL: ${deploymentStatus.log_url}`);
  }

  if (deploymentStatus.environment_url) {
    console.log(`Environment URL: ${deploymentStatus.environment_url}`);
  }
};

// =============================================================================
// RELEASE EVENTS
// =============================================================================

export const processReleaseEvent = async (
  payload: GitHubReleasePayload
): Promise<void> => {
  console.log(`🚀 Processing release event: ${payload.action}`);

  const release = payload.release;
  console.log(`Release: ${release.name || release.tag_name}`);
  console.log(`Tag: ${release.tag_name}`);
  console.log(`Release ID: ${release.id}`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(`Author: ${release.author.login}`);
  console.log(`Draft: ${release.draft}`);
  console.log(`Prerelease: ${release.prerelease}`);
  console.log(`Created at: ${release.created_at}`);
  console.log(`Published at: ${release.published_at || "Not published"}`);
  console.log(`Target commitish: ${release.target_commitish}`);

  if (release.body) {
    console.log(
      `Body: ${release.body.substring(0, 200)}${
        release.body.length > 200 ? "..." : ""
      }`
    );
  }

  if (release.assets && release.assets.length > 0) {
    console.log(`📎 Assets (${release.assets.length}):`);
    release.assets.forEach((asset, index) => {
      console.log(
        `  ${index + 1}. ${asset.name} (${asset.size} bytes, ${
          asset.download_count
        } downloads)`
      );
    });
  }

  switch (payload.action) {
    case "published":
      console.log(`✨ Release published`);
      break;
    case "created":
      console.log(`📝 Release created (draft)`);
      break;
    case "edited":
      console.log(`✏️ Release edited`);
      if (payload.changes) {
        console.log(`Changes: ${Object.keys(payload.changes).join(", ")}`);
      }
      break;
    case "deleted":
      console.log(`🗑️ Release deleted`);
      break;
    case "prereleased":
      console.log(`🚧 Release marked as prerelease`);
      break;
    case "released":
      console.log(`🎉 Release published (no longer prerelease)`);
      break;
    case "unpublished":
      console.log(`📝 Release unpublished (back to draft)`);
      break;
    default:
      console.log(`❓ Unhandled release action: ${payload.action}`);
  }
};

// =============================================================================
// DISCUSSION EVENTS
// =============================================================================

export const processDiscussionEvent = async (
  payload: GitHubDiscussionPayload
): Promise<void> => {
  console.log(`💬 Processing discussion event: ${payload.action}`);

  const discussion = payload.discussion;
  console.log(`Discussion #${discussion.number}: ${discussion.title}`);
  console.log(`Discussion ID: ${discussion.id}`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(`Author: ${discussion.user.login}`);
  console.log(
    `Category: ${discussion.category.name} (${discussion.category.emoji})`
  );
  console.log(`State: ${discussion.state}`);
  console.log(`Locked: ${discussion.locked}`);
  console.log(`Comments: ${discussion.comments}`);
  console.log(`Answerable: ${discussion.category.is_answerable}`);
  console.log(`Answered: ${!!discussion.answer_chosen_at}`);

  if (discussion.answer_chosen_by) {
    console.log(`Answer chosen by: ${discussion.answer_chosen_by.login}`);
    console.log(`Answer chosen at: ${discussion.answer_chosen_at}`);
  }

  if (discussion.body) {
    console.log(
      `Body: ${discussion.body.substring(0, 150)}${
        discussion.body.length > 150 ? "..." : ""
      }`
    );
  }

  if (discussion.labels && discussion.labels.length > 0) {
    console.log(
      `🏷️ Labels: ${discussion.labels.map((l) => l.name).join(", ")}`
    );
  }

  switch (payload.action) {
    case "created":
      console.log(`✨ Discussion created`);
      break;
    case "edited":
      console.log(`✏️ Discussion edited`);
      if (payload.changes) {
        console.log(`Changes: ${Object.keys(payload.changes).join(", ")}`);
      }
      break;
    case "deleted":
      console.log(`🗑️ Discussion deleted`);
      break;
    case "answered":
      console.log(`✅ Discussion answered`);
      if (payload.answer) {
        console.log(`Answer by: ${payload.answer.user.login}`);
      }
      break;
    case "unanswered":
      console.log(`❓ Discussion unanswered`);
      break;
    case "labeled":
      console.log(`🏷️ Discussion labeled`);
      if (payload.label) {
        console.log(`Label: ${payload.label.name}`);
      }
      break;
    case "unlabeled":
      console.log(`🏷️ Discussion unlabeled`);
      if (payload.label) {
        console.log(`Label: ${payload.label.name}`);
      }
      break;
    case "locked":
      console.log(`🔒 Discussion locked`);
      break;
    case "unlocked":
      console.log(`🔓 Discussion unlocked`);
      break;
    case "pinned":
      console.log(`📌 Discussion pinned`);
      break;
    case "unpinned":
      console.log(`📌 Discussion unpinned`);
      break;
    case "category_changed":
      console.log(`📂 Discussion category changed`);
      if (payload.changes?.category) {
        console.log(`Old category: ${payload.changes.category.from.name}`);
        console.log(`New category: ${discussion.category.name}`);
      }
      break;
    case "transferred":
      console.log(`🔄 Discussion transferred`);
      break;
    default:
      console.log(`❓ Unhandled discussion action: ${payload.action}`);
  }
};

export const processDiscussionCommentEvent = async (
  payload: GitHubDiscussionCommentPayload
): Promise<void> => {
  console.log(`💬 Processing discussion comment event: ${payload.action}`);

  const comment = payload.comment;
  const discussion = payload.discussion;

  console.log(`Comment ${comment.id} on discussion #${discussion.number}`);
  console.log(`Discussion: ${discussion.title}`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(`Author: ${comment.user.login}`);
  console.log(`Author association: ${comment.author_association}`);
  console.log(`Created at: ${comment.created_at}`);
  console.log(`Updated at: ${comment.updated_at}`);
  console.log(`Child comments: ${comment.child_comment_count}`);

  if (comment.parent_id) {
    console.log(`Reply to comment: ${comment.parent_id}`);
  }

  if (comment.body) {
    console.log(
      `Comment: ${comment.body.substring(0, 150)}${
        comment.body.length > 150 ? "..." : ""
      }`
    );
  }

  switch (payload.action) {
    case "created":
      console.log(`✨ Discussion comment created`);
      break;
    case "edited":
      console.log(`✏️ Discussion comment edited`);
      if (payload.changes) {
        console.log(`Changes: ${Object.keys(payload.changes).join(", ")}`);
      }
      break;
    case "deleted":
      console.log(`🗑️ Discussion comment deleted`);
      break;
    default:
      console.log(`❓ Unhandled discussion comment action: ${payload.action}`);
  }
};

// =============================================================================
// PACKAGE EVENTS
// =============================================================================

export const processPackageEvent = async (
  payload: GitHubPackagePayload
): Promise<void> => {
  console.log(`📦 Processing package event: ${payload.action}`);

  const packageInfo = payload.package;
  console.log(`Package: ${packageInfo.name}`);
  console.log(`Package ID: ${packageInfo.id}`);
  console.log(`Ecosystem: ${packageInfo.ecosystem}`);
  console.log(`Package type: ${packageInfo.package_type}`);
  console.log(`Owner: ${packageInfo.owner.login} (${packageInfo.owner.type})`);
  console.log(`Visibility: ${packageInfo.visibility}`);
  console.log(`Created at: ${packageInfo.created_at}`);
  console.log(`Updated at: ${packageInfo.updated_at}`);

  if (packageInfo.description) {
    console.log(`Description: ${packageInfo.description}`);
  }

  if (packageInfo.package_version) {
    const version = packageInfo.package_version;
    console.log(`Version: ${version.version}`);
    console.log(`Version ID: ${version.id}`);
    console.log(`Summary: ${version.summary}`);
    console.log(`Package files: ${version.package_files?.length || 0}`);

    if (version.release) {
      console.log(
        `Release: ${version.release.name || version.release.tag_name}`
      );
    }
  }

  if (packageInfo.registry) {
    console.log(
      `Registry: ${packageInfo.registry.name} (${packageInfo.registry.vendor})`
    );
  }

  if (payload.repository) {
    console.log(`Repository: ${payload.repository.full_name}`);
  }

  switch (payload.action) {
    case "published":
      console.log(`✨ Package published`);
      break;
    case "updated":
      console.log(`🔄 Package updated`);
      break;
    default:
      console.log(`❓ Unhandled package action: ${payload.action}`);
  }
};

// =============================================================================
// WIKI (GOLLUM) EVENTS
// =============================================================================

export const processGollumEvent = async (
  payload: GitHubGollumPayload
): Promise<void> => {
  console.log(`📚 Processing gollum (wiki) event`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(`Modified by: ${payload.sender.login}`);
  console.log(`Pages modified: ${payload.pages?.length || 0}`);

  if (payload.pages && payload.pages.length > 0) {
    console.log(`📄 Wiki page changes:`);
    payload.pages.forEach((page, index) => {
      console.log(`  ${index + 1}. ${page.page_name} (${page.action})`);
      console.log(`     Title: ${page.title}`);
      console.log(`     SHA: ${page.sha.substring(0, 7)}`);
      console.log(`     URL: ${page.html_url}`);

      if (page.summary) {
        console.log(`     Summary: ${page.summary}`);
      }
    });
  }
};

// =============================================================================
// COMMIT COMMENT EVENTS
// =============================================================================

export const processCommitCommentEvent = async (
  payload: GitHubCommitCommentPayload
): Promise<void> => {
  console.log(`💬 Processing commit comment event: ${payload.action}`);

  const comment = payload.comment;
  console.log(
    `Comment ${comment.id} on commit ${comment.commit_id.substring(0, 7)}`
  );
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(`Author: ${comment.user.login}`);
  console.log(`Author association: ${comment.author_association}`);
  console.log(`Created at: ${comment.created_at}`);
  console.log(`Updated at: ${comment.updated_at}`);

  if (comment.path) {
    console.log(`File: ${comment.path}`);
  }

  if (comment.line !== null) {
    console.log(`Line: ${comment.line}`);
  }

  if (comment.position !== null) {
    console.log(`Position: ${comment.position}`);
  }

  if (comment.body) {
    console.log(
      `Comment: ${comment.body.substring(0, 150)}${
        comment.body.length > 150 ? "..." : ""
      }`
    );
  }

  switch (payload.action) {
    case "created":
      console.log(`✨ Commit comment created`);
      break;
    default:
      console.log(`❓ Unhandled commit comment action: ${payload.action}`);
  }
};
