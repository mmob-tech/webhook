import {
  GitHubCheckRunPayload,
  GitHubCheckSuitePayload,
  GitHubStatusPayload,
  GitHubWorkflowJobPayload,
  GitHubWorkflowRunPayload,
} from "../types/webhook";

export const processWorkflowRunEvent = async (
  payload: GitHubWorkflowRunPayload
): Promise<void> => {
  console.log(`⚡ Processing workflow run event: ${payload.action}`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(`Workflow: ${payload.workflow_run.name}`);
  console.log(`Run number: ${payload.workflow_run.run_number}`);
  console.log(`Status: ${payload.workflow_run.status}`);
  console.log(`Conclusion: ${payload.workflow_run.conclusion || "N/A"}`);
  console.log(`Event: ${payload.workflow_run.event}`);
  console.log(`Head branch: ${payload.workflow_run.head_branch}`);
  console.log(`Head SHA: ${payload.workflow_run.head_sha.substring(0, 7)}`);
  console.log(`Actor: ${payload.workflow_run.actor.login}`);
  console.log(
    `Triggering actor: ${payload.workflow_run.triggering_actor.login}`
  );
  console.log(`Run attempt: ${payload.workflow_run.run_attempt}`);
  console.log(`Created at: ${payload.workflow_run.created_at}`);
  console.log(`Run started at: ${payload.workflow_run.run_started_at}`);

  if (
    payload.workflow_run.pull_requests &&
    payload.workflow_run.pull_requests.length > 0
  ) {
    console.log(`🔗 Associated PRs:`);
    payload.workflow_run.pull_requests.forEach((pr, index) => {
      console.log(
        `  ${index + 1}. PR #${pr.number}: ${pr.head.ref} → ${pr.base.ref}`
      );
    });
  }

  switch (payload.action) {
    case "completed":
      console.log(`✅ Workflow run completed`);
      console.log(`Final status: ${payload.workflow_run.conclusion}`);
      if (payload.workflow_run.conclusion === "success") {
        console.log(`🎉 Workflow succeeded!`);
      } else if (payload.workflow_run.conclusion === "failure") {
        console.log(`❌ Workflow failed!`);
      } else if (payload.workflow_run.conclusion === "cancelled") {
        console.log(`⏹️ Workflow was cancelled`);
      }
      break;
    case "requested":
      console.log(`🚀 Workflow run requested`);
      break;
    case "in_progress":
      console.log(`🔄 Workflow run in progress`);
      break;
    default:
      console.log(`❓ Unhandled workflow run action: ${payload.action}`);
  }
};

export const processWorkflowJobEvent = async (
  payload: GitHubWorkflowJobPayload
): Promise<void> => {
  console.log(`🔧 Processing workflow job event: ${payload.action}`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(`Job: ${payload.workflow_job.name}`);
  console.log(`Run ID: ${payload.workflow_job.run_id}`);
  console.log(`Status: ${payload.workflow_job.status}`);
  console.log(`Conclusion: ${payload.workflow_job.conclusion || "N/A"}`);
  console.log(`Runner: ${payload.workflow_job.runner_name || "N/A"}`);
  console.log(
    `Runner group: ${payload.workflow_job.runner_group_name || "N/A"}`
  );
  console.log(`Labels: ${payload.workflow_job.labels.join(", ")}`);
  console.log(`Started at: ${payload.workflow_job.started_at || "N/A"}`);

  if (payload.workflow_job.steps && payload.workflow_job.steps.length > 0) {
    console.log(`📋 Steps (${payload.workflow_job.steps.length}):`);
    payload.workflow_job.steps.forEach((step, index) => {
      console.log(
        `  ${index + 1}. ${step.name} - ${step.status} (${
          step.conclusion || "N/A"
        })`
      );
    });
  }

  switch (payload.action) {
    case "queued":
      console.log(`⏳ Job queued`);
      break;
    case "in_progress":
      console.log(`🔄 Job in progress`);
      break;
    case "completed":
      console.log(`✅ Job completed`);
      console.log(`Completed at: ${payload.workflow_job.completed_at}`);
      if (payload.workflow_job.conclusion === "success") {
        console.log(`🎉 Job succeeded!`);
      } else if (payload.workflow_job.conclusion === "failure") {
        console.log(`❌ Job failed!`);
      }
      break;
    default:
      console.log(`❓ Unhandled workflow job action: ${payload.action}`);
  }
};

export const processCheckSuiteEvent = async (
  payload: GitHubCheckSuitePayload
): Promise<void> => {
  console.log(`✅ Processing check suite event: ${payload.action}`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(`Check suite ID: ${payload.check_suite.id}`);
  console.log(`Head branch: ${payload.check_suite.head_branch}`);
  console.log(`Head SHA: ${payload.check_suite.head_sha.substring(0, 7)}`);
  console.log(`Status: ${payload.check_suite.status}`);
  console.log(`Conclusion: ${payload.check_suite.conclusion || "N/A"}`);
  console.log(`App: ${payload.check_suite.app.name}`);

  if (
    payload.check_suite.pull_requests &&
    payload.check_suite.pull_requests.length > 0
  ) {
    console.log(`🔗 Associated PRs:`);
    payload.check_suite.pull_requests.forEach((pr, index) => {
      console.log(`  ${index + 1}. PR #${pr.number}`);
    });
  }

  switch (payload.action) {
    case "completed":
      console.log(`✅ Check suite completed`);
      break;
    case "requested":
      console.log(`🚀 Check suite requested`);
      break;
    case "rerequested":
      console.log(`🔄 Check suite re-requested`);
      break;
    default:
      console.log(`❓ Unhandled check suite action: ${payload.action}`);
  }
};

export const processCheckRunEvent = async (
  payload: GitHubCheckRunPayload
): Promise<void> => {
  console.log(`✅ Processing check run event: ${payload.action}`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(`Check run: ${payload.check_run.name}`);
  console.log(`Head SHA: ${payload.check_run.head_sha.substring(0, 7)}`);
  console.log(`Status: ${payload.check_run.status}`);
  console.log(`Conclusion: ${payload.check_run.conclusion || "N/A"}`);
  console.log(`App: ${payload.check_run.app.name}`);
  console.log(`Started at: ${payload.check_run.started_at}`);

  if (payload.check_run.output) {
    console.log(`📄 Output:`);
    console.log(`  Title: ${payload.check_run.output.title || "N/A"}`);
    console.log(`  Summary: ${payload.check_run.output.summary || "N/A"}`);
    console.log(`  Annotations: ${payload.check_run.output.annotations_count}`);
  }

  switch (payload.action) {
    case "created":
      console.log(`✨ Check run created`);
      break;
    case "completed":
      console.log(`✅ Check run completed`);
      console.log(`Completed at: ${payload.check_run.completed_at}`);
      break;
    case "rerequested":
      console.log(`🔄 Check run re-requested`);
      break;
    case "requested_action":
      console.log(`🎯 Check run requested action`);
      if (payload.requested_action) {
        console.log(`Action: ${payload.requested_action.identifier}`);
      }
      break;
    default:
      console.log(`❓ Unhandled check run action: ${payload.action}`);
  }
};

export const processStatusEvent = async (
  payload: GitHubStatusPayload
): Promise<void> => {
  console.log(`📊 Processing status event`);
  console.log(`Repository: ${payload.repository.full_name}`);
  console.log(`SHA: ${payload.sha.substring(0, 7)}`);
  console.log(`State: ${payload.state}`);
  console.log(`Context: ${payload.context}`);
  console.log(`Description: ${payload.description || "N/A"}`);
  console.log(`Target URL: ${payload.target_url || "N/A"}`);
  console.log(`Created at: ${payload.created_at}`);

  if (payload.branches && payload.branches.length > 0) {
    console.log(`🌿 Branches (${payload.branches.length}):`);
    payload.branches.forEach((branch, index) => {
      console.log(
        `  ${index + 1}. ${branch.name} (protected: ${branch.protected})`
      );
    });
  }

  // Log commit information
  if (payload.commit) {
    console.log(`📝 Commit info:`);
    console.log(`  Message: ${payload.commit.commit.message.split("\n")[0]}`);
    console.log(`  Author: ${payload.commit.commit.author.name}`);
    console.log(`  Committer: ${payload.commit.commit.committer.name}`);
  }

  switch (payload.state) {
    case "success":
      console.log(`✅ Status: Success`);
      break;
    case "failure":
      console.log(`❌ Status: Failure`);
      break;
    case "error":
      console.log(`💥 Status: Error`);
      break;
    case "pending":
      console.log(`⏳ Status: Pending`);
      break;
    default:
      console.log(`❓ Unknown status state: ${payload.state}`);
  }
};
