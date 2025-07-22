import { APIGatewayEvent } from "aws-lambda";
import { WebhookPayload } from "../types/webhook";

export const logWebhookEvent = async (
  eventType: string,
  payload: WebhookPayload,
  event: APIGatewayEvent
): Promise<void> => {
  const startTime = Date.now();

  try {
    const logData = {
      timestamp: new Date().toISOString(),
      event_type: eventType,
      delivery_id:
        event.headers["X-GitHub-Delivery"] ||
        event.headers["x-github-delivery"],
      user_agent: event.headers["User-Agent"] || event.headers["user-agent"],
      source_ip:
        event.headers["X-Forwarded-For"] || event.headers["x-forwarded-for"],
      github_event:
        event.headers["X-GitHub-Event"] || event.headers["x-github-event"],
      content_type:
        event.headers["Content-Type"] || event.headers["content-type"],
      content_length:
        event.headers["Content-Length"] || event.headers["content-length"],

      payload_info: {
        // Repository information
        ...(payload &&
          "repository" in payload &&
          payload.repository && {
            repository: payload.repository.full_name,
            repository_id: payload.repository.id,
            repository_private: payload.repository.private,
            repository_owner: payload.repository.owner?.login,
            repository_owner_type: payload.repository.owner?.type,
            default_branch: payload.repository.default_branch,
            language: payload.repository.language || null,
            stars_count: payload.repository.stargazers_count || 0,
            forks_count: payload.repository.forks_count || 0,
            open_issues_count: payload.repository.open_issues_count || 0,
            repository_size: payload.repository.size || 0,
            archived: payload.repository.archived || false,
            disabled: payload.repository.disabled || false,
            topics: payload.repository.topics || [],
            visibility: payload.repository.visibility || null,
            fork: payload.repository.fork || false,
          }),

        // Sender information
        ...(payload &&
          "sender" in payload &&
          payload.sender && {
            sender: payload.sender.login,
            sender_id: payload.sender.id,
            sender_type: payload.sender.type,
            sender_site_admin: payload.sender.site_admin || false,
            sender_node_id: payload.sender.node_id,
          }),

        // Organization information
        ...(payload &&
          "organization" in payload &&
          payload.organization && {
            organization: payload.organization.login,
            organization_id: payload.organization.id,
          }),

        // Action information (for most events)
        ...(payload && "action" in payload && { action: payload.action }),

        // Ping event specific
        ...(eventType === "ping" &&
          "hook_id" in payload && {
            hook_id: payload.hook_id,
            zen: "zen" in payload ? payload.zen : undefined,
            hook_active:
              "hook" in payload && payload.hook
                ? payload.hook.active
                : undefined,
            hook_events:
              "hook" in payload && payload.hook?.events
                ? payload.hook.events
                : [],
          }),
        // dependabot_alert Streaming specific
        ...(eventType === "dependabot_alert" &&
          "alert" in payload &&
          payload.alert && {
            alert_number: payload.alert.number,
            alert_state: payload.alert.state,
            package_ecosystem: payload.alert.dependency.package.ecosystem,
            package_name: payload.alert.dependency.package.name,
            manifest_path: payload.alert.dependency.manifest_path,
            dependency_scope: payload.alert.dependency.scope,
            vulnerability_severity:
              payload.alert.security_vulnerability.severity,
            advisory_ghsa_id: payload.alert.security_advisory.ghsa_id,
            advisory_cve_id: payload.alert.security_advisory.cve_id,
            advisory_summary: payload.alert.security_advisory.summary,
            cvss_score: payload.alert.security_advisory.cvss.score,
            vulnerable_version_range:
              payload.alert.security_vulnerability.vulnerable_version_range,
            first_patched_version:
              payload.alert.security_vulnerability.first_patched_version
                ?.identifier || null,
            dismissed_by: payload.alert.dismissed_by?.login || null,
            dismissed_reason: payload.alert.dismissed_reason,
            dismissed_comment_length:
              payload.alert.dismissed_comment?.length || 0,
            cwes_count: payload.alert.security_advisory.cwes?.length || 0,
            references_count:
              payload.alert.security_advisory.references?.length || 0,
            created_at: payload.alert.created_at,
            fixed_at: payload.alert.fixed_at,
            auto_dismissed_at: payload.alert.auto_dismissed_at,
          }),
        // Audit Log Streaming specific
        ...(eventType === "audit_log_streaming" &&
          "audit_log_events" in payload &&
          Array.isArray(payload.audit_log_events) && {
            audit_events_count: payload.audit_log_events.length,
            audit_actors: payload.audit_log_events
              .map((e) => e.actor?.login)
              .filter(Boolean),
            audit_actions: payload.audit_log_events.map((e) => e.action),
            installation_id:
              "installation" in payload ? payload.installation?.id : undefined,
          }),

        // Pull Request specific
        ...(eventType === "pull_request" &&
          "pull_request" in payload &&
          payload.pull_request && {
            pr_number: payload.pull_request.number,
            pr_title: payload.pull_request.title,
            pr_state: payload.pull_request.state,
            pr_draft: payload.pull_request.draft || false,
            pr_merged: payload.pull_request.merged || false,
            pr_author: payload.pull_request.user?.login,
            pr_author_association: payload.pull_request.author_association,
            head_ref: payload.pull_request.head?.ref,
            base_ref: payload.pull_request.base?.ref,
            commits_count: payload.pull_request.commits || 0,
            additions: payload.pull_request.additions || 0,
            deletions: payload.pull_request.deletions || 0,
            changed_files: payload.pull_request.changed_files || 0,
            comments: payload.pull_request.comments || 0,
            review_comments: payload.pull_request.review_comments || 0,
            mergeable: payload.pull_request.mergeable,
            mergeable_state: payload.pull_request.mergeable_state,
            assignees_count: payload.pull_request.assignees?.length || 0,
          }),

        // Issues specific
        ...(eventType === "issues" &&
          "issue" in payload &&
          payload.issue && {
            issue_number: payload.issue.number,
            issue_title: payload.issue.title,
            issue_state: payload.issue.state,
            issue_author: payload.issue.user?.login,
            issue_author_association: payload.issue.author_association,
            comments_count: payload.issue.comments || 0,
            assignees_count: payload.issue.assignees?.length || 0,
            labels_count: payload.issue.labels?.length || 0,
            locked: payload.issue.locked || false,
            milestone: payload.issue.milestone?.title || null,
            state_reason: payload.issue.state_reason || null,
          }),

        // Push specific
        ...(eventType === "push" &&
          "ref" in payload && {
            ref: payload.ref,
            before:
              "before" in payload ? payload.before?.substring(0, 7) : undefined,
            after:
              "after" in payload ? payload.after?.substring(0, 7) : undefined,
            commits_count:
              "commits" in payload && Array.isArray(payload.commits)
                ? payload.commits.length
                : 0,
            forced: "forced" in payload ? payload.forced : false,
            created: "created" in payload ? payload.created : false,
            deleted: "deleted" in payload ? payload.deleted : false,
            pusher_name:
              "pusher" in payload && payload.pusher
                ? payload.pusher.name
                : undefined,
            pusher_email:
              "pusher" in payload && payload.pusher
                ? payload.pusher.email
                : undefined,
            head_commit_message:
              "head_commit" in payload && payload.head_commit
                ? payload.head_commit.message?.split("\n")[0]
                : undefined,
            distinct_commits:
              "commits" in payload && Array.isArray(payload.commits)
                ? payload.commits.filter((c) => c.distinct).length
                : 0,
          }),

        // Star specific
        ...(eventType === "star" &&
          "starred_at" in payload && {
            starred_at: payload.starred_at,
            star_action: "action" in payload ? payload.action : undefined,
          }),

        // Fork specific
        ...(eventType === "fork" &&
          "forkee" in payload &&
          payload.forkee && {
            fork_name: payload.forkee.full_name,
            fork_private: payload.forkee.private || false,
            fork_owner: payload.forkee.owner?.login,
            fork_default_branch: payload.forkee.default_branch,
            fork_created_at: payload.forkee.created_at,
            parent_is_fork:
              "repository" in payload
                ? payload.repository?.fork || false
                : undefined,
          }),

        // Watch specific
        ...(eventType === "watch" && {
          watch_action: "action" in payload ? payload.action : undefined,
        }),

        // Workflow run specific
        ...(eventType === "workflow_run" &&
          "workflow_run" in payload &&
          payload.workflow_run && {
            workflow_name: payload.workflow_run.name,
            workflow_id: payload.workflow_run.workflow_id,
            run_id: payload.workflow_run.id,
            run_number: payload.workflow_run.run_number,
            run_attempt: payload.workflow_run.run_attempt || 1,
            status: payload.workflow_run.status,
            conclusion: payload.workflow_run.conclusion,
            event: payload.workflow_run.event,
            head_branch: payload.workflow_run.head_branch,
            head_sha: payload.workflow_run.head_sha?.substring(0, 7),
            actor: payload.workflow_run.actor?.login,
            triggering_actor: payload.workflow_run.triggering_actor?.login,
            pull_requests_count:
              payload.workflow_run.pull_requests?.length || 0,
          }),

        // Workflow job specific
        ...(eventType === "workflow_job" &&
          "workflow_job" in payload &&
          payload.workflow_job && {
            job_id: payload.workflow_job.id,
            job_name: payload.workflow_job.name,
            job_status: payload.workflow_job.status,
            job_conclusion: payload.workflow_job.conclusion,
            run_id: payload.workflow_job.run_id,
            runner_id: payload.workflow_job.runner_id,
            runner_name: payload.workflow_job.runner_name,
            runner_group_id: payload.workflow_job.runner_group_id,
            runner_group_name: payload.workflow_job.runner_group_name,
            labels: payload.workflow_job.labels || [],
            steps_count: payload.workflow_job.steps?.length || 0,
          }),

        // Release specific
        ...(eventType === "release" &&
          "release" in payload &&
          payload.release && {
            release_id: payload.release.id,
            release_name: payload.release.name || payload.release.tag_name,
            tag_name: payload.release.tag_name,
            target_commitish: payload.release.target_commitish,
            draft: payload.release.draft || false,
            prerelease: payload.release.prerelease || false,
            release_author: payload.release.author?.login,
            assets_count: payload.release.assets?.length || 0,
            body_length: payload.release.body?.length || 0,
          }),

        // Discussion specific
        ...(eventType === "discussion" &&
          "discussion" in payload &&
          payload.discussion && {
            discussion_id: payload.discussion.id,
            discussion_number: payload.discussion.number,
            discussion_title: payload.discussion.title,
            discussion_category: payload.discussion.category?.name,
            discussion_category_emoji: payload.discussion.category?.emoji,
            discussion_state: payload.discussion.state,
            discussion_locked: payload.discussion.locked || false,
            discussion_author: payload.discussion.user?.login,
            comments_count: payload.discussion.comments || 0,
          }),

        // Discussion comment specific
        ...(eventType === "discussion_comment" &&
          "comment" in payload &&
          payload.comment &&
          "discussion" in payload && {
            comment_id: payload.comment.id,
            comment_author: payload.comment.user?.login,
            comment_author_association: payload.comment.author_association,
            discussion_number: payload.discussion?.number,
            parent_id: payload.comment.parent_id,
            child_comment_count: payload.comment.child_comment_count || 0,
            body_length: payload.comment.body?.length || 0,
          }),

        // Create/Delete specific
        ...((eventType === "create" || eventType === "delete") &&
          "ref_type" in payload &&
          "ref" in payload && {
            ref_type: payload.ref_type,
            ref: payload.ref,
            master_branch:
              "master_branch" in payload ? payload.master_branch : undefined,
            pusher_type:
              "pusher_type" in payload ? payload.pusher_type : undefined,
            description:
              "description" in payload ? payload.description : undefined,
          }),

        // Check Suite specific
        ...(eventType === "check_suite" &&
          "check_suite" in payload &&
          payload.check_suite && {
            check_suite_id: payload.check_suite.id,
            check_suite_status: payload.check_suite.status,
            check_suite_conclusion: payload.check_suite.conclusion,
            head_branch: payload.check_suite.head_branch,
            head_sha: payload.check_suite.head_sha?.substring(0, 7),
            app_id: payload.check_suite.app?.id,
            app_name: payload.check_suite.app?.name,
            pull_requests_count: payload.check_suite.pull_requests?.length || 0,
          }),

        // Check Run specific
        ...(eventType === "check_run" &&
          "check_run" in payload &&
          payload.check_run && {
            check_run_id: payload.check_run.id,
            check_run_name: payload.check_run.name,
            check_run_status: payload.check_run.status,
            check_run_conclusion: payload.check_run.conclusion,
            head_sha: payload.check_run.head_sha?.substring(0, 7),
            app_id: payload.check_run.app?.id,
            app_name: payload.check_run.app?.name,
            check_suite_id: payload.check_run.check_suite?.id,
            annotations_count: payload.check_run.output?.annotations_count || 0,
          }),

        // Status specific
        ...(eventType === "status" && {
          ...(payload &&
            "sha" in payload && {
              commit_sha: payload.sha?.substring(0, 7),
            }),
          ...(payload &&
            "state" in payload && {
              status_state: payload.state,
            }),
          ...(payload &&
            "context" in payload && {
              status_context: payload.context,
            }),
          ...(payload &&
            "description" in payload && {
              status_description: payload.description,
            }),
          ...(payload &&
            "target_url" in payload && {
              target_url: !!payload.target_url,
            }),
          branches_count:
            payload && "branches" in payload && Array.isArray(payload.branches)
              ? payload.branches.length
              : 0,
        }),

        // Team specific
        ...(eventType === "team" &&
          "team" in payload &&
          payload.team && {
            team_id: payload.team.id,
            team_name: payload.team.name,
            team_slug: payload.team.slug,
            team_privacy: payload.team.privacy,
            team_permission: payload.team.permission,
            members_count: payload.team.members_count || 0,
            repos_count: payload.team.repos_count || 0,
            parent_team: payload.team.parent?.name || null,
          }),

        // Member specific
        ...(eventType === "member" &&
          "member" in payload &&
          payload.member && {
            member_id: payload.member.id,
            member_login: payload.member.login,
            member_type: payload.member.type,
            member_site_admin: payload.member.site_admin || false,
          }),

        // Organization specific
        ...(eventType === "organization" && {
          ...(payload &&
            "membership" in payload &&
            payload.membership && {
              membership_user: payload.membership.user?.login,
              membership_role: payload.membership.role,
              membership_state: payload.membership.state,
            }),
          ...(payload &&
            "invitation" in payload &&
            payload.invitation && {
              invitation_login:
                payload.invitation.login || payload.invitation.email,
              invitation_role: payload.invitation.role,
              team_count: payload.invitation.team_count || 0,
              inviter: payload.invitation.inviter?.login,
            }),
        }),

        // Package specific
        ...(eventType === "package" &&
          "package" in payload &&
          payload.package && {
            package_id: payload.package.id,
            package_name: payload.package.name,
            package_type: payload.package.package_type,
            package_ecosystem: payload.package.ecosystem,
            package_visibility: payload.package.visibility,
            package_owner: payload.package.owner?.login,
            package_owner_type: payload.package.owner?.type,
            registry_name: payload.package.registry?.name,
            version: payload.package.package_version?.version,
          }),

        // Deployment specific
        ...(eventType === "deployment" &&
          "deployment" in payload &&
          payload.deployment && {
            deployment_id: payload.deployment.id,
            deployment_environment: payload.deployment.environment,
            deployment_ref: payload.deployment.ref,
            deployment_sha: payload.deployment.sha?.substring(0, 7),
            deployment_task: payload.deployment.task,
            deployment_creator: payload.deployment.creator?.login,
            auto_merge: payload.deployment.auto_merge || false,
            production_environment:
              payload.deployment.production_environment || false,
            transient_environment:
              payload.deployment.transient_environment || false,
          }),

        // Deployment Status specific
        ...(eventType === "deployment_status" &&
          "deployment_status" in payload &&
          payload.deployment_status && {
            deployment_status_id: payload.deployment_status.id,
            deployment_id:
              "deployment" in payload ? payload.deployment?.id : undefined,
            deployment_status_state: payload.deployment_status.state,
            deployment_status_creator: payload.deployment_status.creator?.login,
            environment: payload.deployment_status.environment,
            has_target_url: !!payload.deployment_status.target_url,
            has_log_url: !!payload.deployment_status.log_url,
            has_environment_url: !!payload.deployment_status.environment_url,
          }),

        // Gollum (wiki) specific
        ...(eventType === "gollum" &&
          "pages" in payload &&
          Array.isArray(payload.pages) && {
            wiki_pages_count: payload.pages.length,
            wiki_page_actions: payload.pages.map((p) => p.action),
            wiki_page_names: payload.pages.map((p) => p.page_name),
          }),

        // Commit Comment specific
        ...(eventType === "commit_comment" &&
          "comment" in payload &&
          payload.comment && {
            comment_id: payload.comment.id,
            comment_author: payload.comment.user?.login,
            comment_author_association: payload.comment.author_association,
            body_length: payload.comment.body?.length || 0,
          }),

        // Issue Comment specific (covers both issues and PR comments)
        ...(eventType === "issue_comment" &&
          "comment" in payload &&
          payload.comment &&
          "issue" in payload && {
            comment_id: payload.comment.id,
            comment_author: payload.comment.user?.login,
            comment_author_association: payload.comment.author_association,
            issue_number: payload.issue?.number,
            issue_type: payload.issue?.pull_request ? "pull_request" : "issue",
            body_length: payload.comment.body?.length || 0,
          }),

        // Pull Request Review specific
        ...(eventType === "pull_request_review" &&
          "review" in payload &&
          payload.review && {
            review_id: payload.review.id,
            reviewer: payload.review.user?.login,
            review_state: payload.review.state,
            pr_number:
              "pull_request" in payload
                ? payload.pull_request?.number
                : undefined,
            commit_id: payload.review.commit_id?.substring(0, 7),
            body_length: payload.review.body?.length || 0,
          }),

        // Pull Request Review Comment specific
        ...(eventType === "pull_request_review_comment" &&
          "comment" in payload &&
          payload.comment && {
            comment_id: payload.comment.id,
            comment_author: payload.comment.user?.login,
            pr_number:
              "pull_request" in payload
                ? payload.pull_request?.number
                : undefined,
            body_length: payload.comment.body?.length || 0,
          }),

        // Milestone specific
        ...(eventType === "milestone" &&
          "milestone" in payload &&
          payload.milestone && {
            milestone_id: payload.milestone.id,
            milestone_title: payload.milestone.title,
            milestone_number: payload.milestone.number,
            milestone_state: payload.milestone.state,
            milestone_creator: payload.milestone.creator?.login,
            open_issues: payload.milestone.open_issues || 0,
            closed_issues: payload.milestone.closed_issues || 0,
            due_on: payload.milestone.due_on,
          }),

        // Public event specific (when repository goes from private to public)
        ...(eventType === "public" && {
          made_public: true,
        }),
      },

      // Request metadata
      request_info: {
        method: event.httpMethod,
        path: event.path,
        query_parameters: event.queryStringParameters,
        body_size: event.body ? event.body.length : 0,
        is_base64_encoded: event.isBase64Encoded || false,
        headers_count: Object.keys(event.headers || {}).length,
        stage: event.requestContext?.stage,
        request_id: event.requestContext?.requestId,
        account_id: event.requestContext?.accountId,
      },

      // Performance metadata
      performance: {
        processing_start: startTime,
        payload_size_bytes: event.body
          ? Buffer.byteLength(event.body, "utf8")
          : 0,
      },
    };

    const processingTime = Date.now() - startTime;

    console.log("📊 Webhook Event Log:", JSON.stringify(logData, null, 2));

    // Optional: Structured logging for different log levels
    if (processingTime > 1000) {
      console.warn(
        `⚠️ Slow logging operation: ${processingTime}ms for ${eventType}`
      );
    }

    console.log(`⚡ Logging completed in ${processingTime}ms`);
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(
      `❌ Error logging webhook event after ${processingTime}ms:`,
      error
    );

    // Fallback minimal logging
    console.log("📊 Webhook Event (minimal):", {
      timestamp: new Date().toISOString(),
      event_type: eventType,
      delivery_id:
        event.headers["X-GitHub-Delivery"] ||
        event.headers["x-github-delivery"],
      error: "Failed to parse full payload",
      error_message: error instanceof Error ? error.message : "Unknown error",
      processing_time_ms: processingTime,
    });
  }
};

/**
 * Helper function for development/testing - logs webhook payload in a more readable format
 */
export const logWebhookPayloadDebug = (
  eventType: string,
  payload: WebhookPayload
): void => {
  console.log(`🔍 DEBUG - ${eventType.toUpperCase()} EVENT PAYLOAD:`);
  console.log("=".repeat(50));

  // Log main properties
  Object.entries(payload).forEach(([key, value]) => {
    if (typeof value === "object" && value !== null) {
      console.log(
        `${key}:`,
        JSON.stringify(value, null, 2).substring(0, 200) + "..."
      );
    } else {
      console.log(`${key}:`, value);
    }
  });

  console.log("=".repeat(50));
};

/**
 * Simple performance logger for webhook processing
 */
export const createWebhookTimer = (eventType: string) => {
  const startTime = Date.now();

  return {
    end: () => {
      const duration = Date.now() - startTime;
      console.log(`⏱️ ${eventType} processing took ${duration}ms`);
      return duration;
    },
    mark: (label: string) => {
      const duration = Date.now() - startTime;
      console.log(`📍 ${eventType}:${label} at ${duration}ms`);
    },
  };
};
