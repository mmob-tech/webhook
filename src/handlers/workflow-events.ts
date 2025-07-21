import { Callback } from "aws-lambda";
import {
  processCheckRunEvent,
  processCheckSuiteEvent,
  processStatusEvent,
  processWorkflowJobEvent,
  processWorkflowRunEvent,
} from "../processors";
import {
  GitHubCheckRunPayload,
  GitHubCheckSuitePayload,
  GitHubStatusPayload,
  GitHubWorkflowJobPayload,
  GitHubWorkflowRunPayload,
  WebhookPayload,
} from "../types/webhook";
import { buildSuccessResponse } from "../utils/response-builder";

export const handleWorkflowEvents = async (
  eventType: string,
  payload: WebhookPayload,
  callback: Callback
) => {
  console.log(`⚡ Handling workflow event: ${eventType}`);

  switch (eventType) {
    case "workflow_run":
      return await handleWorkflowRunEvent(
        payload as GitHubWorkflowRunPayload,
        callback
      );

    case "workflow_job":
      return await handleWorkflowJobEvent(
        payload as GitHubWorkflowJobPayload,
        callback
      );

    case "check_suite":
      return await handleCheckSuiteEvent(
        payload as GitHubCheckSuitePayload,
        callback
      );

    case "check_run":
      return await handleCheckRunEvent(
        payload as GitHubCheckRunPayload,
        callback
      );

    case "status":
      return await handleStatusEvent(payload as GitHubStatusPayload, callback);

    default:
      return callback(
        null,
        buildSuccessResponse(`Unhandled workflow event: ${eventType}`)
      );
  }
};

const handleWorkflowRunEvent = async (
  payload: GitHubWorkflowRunPayload,
  callback: Callback
) => {
  console.log(
    `⚡ Workflow run ${payload.action}: ${payload.workflow_run.name}`
  );
  await processWorkflowRunEvent(payload);

  return callback(
    null,
    buildSuccessResponse(`Workflow run ${payload.action} event processed`, {
      repository: payload.repository.full_name,
      workflow_name: payload.workflow_run.name,
      run_number: payload.workflow_run.run_number,
      run_attempt: payload.workflow_run.run_attempt,
      status: payload.workflow_run.status,
      conclusion: payload.workflow_run.conclusion,
      event: payload.workflow_run.event,
      head_branch: payload.workflow_run.head_branch,
      head_sha: payload.workflow_run.head_sha.substring(0, 7),
      triggering_actor: payload.workflow_run.triggering_actor.login,
      action: payload.action,
    })
  );
};

const handleWorkflowJobEvent = async (
  payload: GitHubWorkflowJobPayload,
  callback: Callback
) => {
  console.log(
    `🔧 Workflow job ${payload.action}: ${payload.workflow_job.name}`
  );
  await processWorkflowJobEvent(payload);

  return callback(
    null,
    buildSuccessResponse(`Workflow job ${payload.action} event processed`, {
      repository: payload.repository.full_name,
      job_name: payload.workflow_job.name,
      run_id: payload.workflow_job.run_id,
      status: payload.workflow_job.status,
      conclusion: payload.workflow_job.conclusion,
      runner_name: payload.workflow_job.runner_name,
      runner_group: payload.workflow_job.runner_group_name,
      labels: payload.workflow_job.labels,
      action: payload.action,
    })
  );
};

const handleCheckSuiteEvent = async (
  payload: GitHubCheckSuitePayload,
  callback: Callback
) => {
  console.log(`✅ Check suite ${payload.action}: ${payload.check_suite.id}`);
  await processCheckSuiteEvent(payload);

  return callback(
    null,
    buildSuccessResponse(`Check suite ${payload.action} event processed`, {
      repository: payload.repository.full_name,
      check_suite_id: payload.check_suite.id,
      status: payload.check_suite.status,
      conclusion: payload.check_suite.conclusion,
      head_branch: payload.check_suite.head_branch,
      head_sha: payload.check_suite.head_sha.substring(0, 7),
      app_name: payload.check_suite.app.name,
      action: payload.action,
    })
  );
};

const handleCheckRunEvent = async (
  payload: GitHubCheckRunPayload,
  callback: Callback
) => {
  console.log(`✅ Check run ${payload.action}: ${payload.check_run.name}`);
  await processCheckRunEvent(payload);

  return callback(
    null,
    buildSuccessResponse(`Check run ${payload.action} event processed`, {
      repository: payload.repository.full_name,
      check_run_name: payload.check_run.name,
      status: payload.check_run.status,
      conclusion: payload.check_run.conclusion,
      head_sha: payload.check_run.head_sha.substring(0, 7),
      app_name: payload.check_run.app.name,
      action: payload.action,
    })
  );
};

const handleStatusEvent = async (
  payload: GitHubStatusPayload,
  callback: Callback
) => {
  console.log(`📊 Status event: ${payload.state} for ${payload.context}`);
  await processStatusEvent(payload);

  return callback(
    null,
    buildSuccessResponse("Status event processed", {
      repository: payload.repository.full_name,
      sha: payload.sha.substring(0, 7),
      state: payload.state,
      context: payload.context,
      description: payload.description,
      target_url: payload.target_url,
      branches: payload.branches?.map((b) => b.name) || [],
    })
  );
};
