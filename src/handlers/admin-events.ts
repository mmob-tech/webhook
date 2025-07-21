import { Callback } from "aws-lambda";
import {
  processDeploymentEvent,
  processDeploymentStatusEvent,
  processMemberEvent,
  processOrganizationEvent,
  processTeamEvent,
} from "../processors";
import {
  GitHubDeploymentPayload,
  GitHubDeploymentStatusPayload,
  GitHubMemberPayload,
  GitHubOrganizationPayload,
  GitHubTeamPayload,
  WebhookPayload,
} from "../types/webhook";
import { buildSuccessResponse } from "../utils/response-builder";

export const handleAdminEvents = async (
  eventType: string,
  payload: WebhookPayload,
  callback: Callback
) => {
  console.log(`🏢 Handling admin event: ${eventType}`);

  switch (eventType) {
    case "organization":
      return await handleOrganizationEvent(
        payload as GitHubOrganizationPayload,
        callback
      );

    case "team":
      return await handleTeamEvent(payload as GitHubTeamPayload, callback);

    case "member":
      return await handleMemberEvent(payload as GitHubMemberPayload, callback);

    case "deployment":
      return await handleDeploymentEvent(
        payload as GitHubDeploymentPayload,
        callback
      );

    case "deployment_status":
      return await handleDeploymentStatusEvent(
        payload as GitHubDeploymentStatusPayload,
        callback
      );

    default:
      return callback(
        null,
        buildSuccessResponse(`Unhandled admin event: ${eventType}`)
      );
  }
};

const handleOrganizationEvent = async (
  payload: GitHubOrganizationPayload,
  callback: Callback
) => {
  console.log(
    `🏢 Organization ${payload.action}: ${payload.organization.login}`
  );
  await processOrganizationEvent(payload);

  return callback(
    null,
    buildSuccessResponse(`Organization ${payload.action} event processed`, {
      organization: payload.organization.login,
      action: payload.action,
      organization_id: payload.organization.id,
      public_repos: payload.organization.public_repos,
      total_private_repos: payload.organization.total_private_repos,
      public_members_count: payload.organization.public_members_count,
      ...(payload.membership && {
        affected_user: payload.membership.user.login,
        membership_role: payload.membership.role,
        membership_state: payload.membership.state,
      }),
      ...(payload.invitation && {
        invited_user: payload.invitation.login || payload.invitation.email,
        invitation_role: payload.invitation.role,
        team_count: payload.invitation.team_count,
      }),
      ...(payload.changes && {
        changes: Object.keys(payload.changes),
      }),
    })
  );
};

const handleTeamEvent = async (
  payload: GitHubTeamPayload,
  callback: Callback
) => {
  console.log(`👥 Team ${payload.action}: ${payload.team.name}`);
  await processTeamEvent(payload);

  return callback(
    null,
    buildSuccessResponse(`Team ${payload.action} event processed`, {
      team_name: payload.team.name,
      team_id: payload.team.id,
      team_slug: payload.team.slug,
      organization: payload.organization.login,
      action: payload.action,
      privacy: payload.team.privacy,
      permission: payload.team.permission,
      members_count: payload.team.members_count,
      repos_count: payload.team.repos_count,
      ...(payload.repository && {
        repository: payload.repository.full_name,
      }),
      ...(payload.changes && {
        changes: Object.keys(payload.changes),
      }),
    })
  );
};

const handleMemberEvent = async (
  payload: GitHubMemberPayload,
  callback: Callback
) => {
  console.log(`👤 Member ${payload.action}: ${payload.member.login}`);
  await processMemberEvent(payload);

  return callback(
    null,
    buildSuccessResponse(`Member ${payload.action} event processed`, {
      member: payload.member.login,
      member_id: payload.member.id,
      repository: payload.repository.full_name,
      action: payload.action,
      member_type: payload.member.type,
      site_admin: payload.member.site_admin,
      ...(payload.changes?.permission && {
        old_permission: payload.changes.permission.from,
        new_permission: payload.changes.permission.to,
      }),
    })
  );
};

const handleDeploymentEvent = async (
  payload: GitHubDeploymentPayload,
  callback: Callback
) => {
  console.log(`🚀 Deployment created: ${payload.deployment.id}`);
  await processDeploymentEvent(payload);

  return callback(
    null,
    buildSuccessResponse("Deployment event processed", {
      deployment_id: payload.deployment.id,
      environment: payload.deployment.environment,
      ref: payload.deployment.ref,
      sha: payload.deployment.sha.substring(0, 7),
      creator: payload.deployment.creator.login,
      task: payload.deployment.task,
      auto_merge: payload.deployment.auto_merge,
      description: payload.deployment.description,
      repository: payload.repository.full_name,
      required_contexts: payload.deployment.required_contexts || [],
    })
  );
};

const handleDeploymentStatusEvent = async (
  payload: GitHubDeploymentStatusPayload,
  callback: Callback
) => {
  console.log(
    `📊 Deployment status ${payload.action}: ${payload.deployment_status.state}`
  );
  await processDeploymentStatusEvent(payload);

  return callback(
    null,
    buildSuccessResponse(
      `Deployment status ${payload.action} event processed`,
      {
        deployment_id: payload.deployment.id,
        deployment_status_id: payload.deployment_status.id,
        state: payload.deployment_status.state,
        environment:
          payload.deployment_status.environment ||
          payload.deployment.environment,
        creator: payload.deployment_status.creator.login,
        target_url: payload.deployment_status.target_url,
        description: payload.deployment_status.description,
        repository: payload.repository.full_name,
        action: payload.action,
      }
    )
  );
};
