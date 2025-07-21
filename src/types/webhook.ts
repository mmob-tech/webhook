// =============================================================================
// GITHUB WEBHOOK TYPE DEFINITIONS
// =============================================================================

// Base interfaces
export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: "User" | "Bot" | "Organization";
  site_admin: boolean;
  name?: string;
  email?: string;
}

export interface GitHubRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  owner: GitHubUser;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  clone_url: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  forks_count: number;
  open_issues_count: number;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
}

export interface GitHubOrganization {
  login: string;
  id: number;
  node_id: string;
  url: string;
  repos_url: string;
  events_url: string;
  hooks_url: string;
  issues_url: string;
  members_url: string;
  public_members_url: string;
  avatar_url: string;
  description: string | null;
}

export interface GitHubLabel {
  id: number;
  node_id: string;
  url: string;
  name: string;
  color: string;
  default: boolean;
  description: string | null;
}

// =============================================================================
// WEBHOOK PAYLOAD INTERFACES
// =============================================================================

export interface GitHubPingPayload {
  zen: string;
  hook_id: number;
  hook: any;
  repository?: GitHubRepository;
  sender: GitHubUser;
}

export interface GitHubRepositoryPayload {
  action:
    | "created"
    | "deleted"
    | "archived"
    | "unarchived"
    | "edited"
    | "renamed"
    | "transferred"
    | "publicized"
    | "privatized";
  repository: GitHubRepository;
  changes?: any;
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

export interface GitHubPushPayload {
  ref: string;
  before: string;
  after: string;
  created: boolean;
  deleted: boolean;
  forced: boolean;
  base_ref: string | null;
  compare: string;
  commits: Array<{
    id: string;
    tree_id: string;
    distinct: boolean;
    message: string;
    timestamp: string;
    url: string;
    author: { name: string; email: string; username?: string };
    committer: { name: string; email: string; username?: string };
    added: string[];
    removed: string[];
    modified: string[];
  }>;
  head_commit: any;
  repository: GitHubRepository;
  pusher: { name: string; email: string };
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

export interface GitHubPullRequestPayload {
  action:
    | "opened"
    | "edited"
    | "closed"
    | "reopened"
    | "assigned"
    | "unassigned"
    | "review_requested"
    | "review_request_removed"
    | "labeled"
    | "unlabeled"
    | "synchronize"
    | "ready_for_review"
    | "converted_to_draft";
  number: number;
  pull_request: {
    url: string;
    id: number;
    node_id: string;
    html_url: string;
    number: number;
    state: "open" | "closed";
    locked: boolean;
    title: string;
    user: GitHubUser;
    body: string | null;
    created_at: string;
    updated_at: string;
    closed_at: string | null;
    merged_at: string | null;
    merge_commit_sha: string | null;
    assignee: GitHubUser | null;
    assignees: GitHubUser[];
    requested_reviewers: GitHubUser[];
    labels: GitHubLabel[];
    milestone: any;
    draft: boolean;
    commits_url: string;
    review_comments_url: string;
    comments_url: string;
    statuses_url: string;
    head: {
      label: string;
      ref: string;
      sha: string;
      user: GitHubUser;
      repo: GitHubRepository | null;
    };
    base: {
      label: string;
      ref: string;
      sha: string;
      user: GitHubUser;
      repo: GitHubRepository;
    };
    author_association: string;
    auto_merge: any;
    merged: boolean;
    mergeable: boolean | null;
    merged_by: GitHubUser | null;
    comments: number;
    review_comments: number;
    commits: number;
    additions: number;
    deletions: number;
    changed_files: number;
  };
  changes?: any;
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
  assignee?: GitHubUser;
  label?: GitHubLabel;
}

export interface GitHubIssuesPayload {
  action:
    | "opened"
    | "edited"
    | "deleted"
    | "closed"
    | "reopened"
    | "assigned"
    | "unassigned"
    | "labeled"
    | "unlabeled"
    | "locked"
    | "unlocked";
  issue: {
    url: string;
    repository_url: string;
    labels_url: string;
    comments_url: string;
    events_url: string;
    html_url: string;
    id: number;
    node_id: string;
    number: number;
    title: string;
    user: GitHubUser;
    labels: GitHubLabel[];
    state: "open" | "closed";
    locked: boolean;
    assignee: GitHubUser | null;
    assignees: GitHubUser[];
    milestone: any;
    comments: number;
    created_at: string;
    updated_at: string;
    closed_at: string | null;
    author_association: string;
    body: string | null;
    state_reason?: string | null;
  };
  changes?: any;
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
  assignee?: GitHubUser;
  label?: GitHubLabel;
}

export interface GitHubIssueCommentPayload {
  action: "created" | "edited" | "deleted";
  issue: GitHubIssuesPayload["issue"];
  comment: {
    url: string;
    html_url: string;
    issue_url: string;
    id: number;
    node_id: string;
    user: GitHubUser;
    created_at: string;
    updated_at: string;
    author_association: string;
    body: string;
    reactions: any;
  };
  changes?: any;
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

export interface GitHubPullRequestReviewPayload {
  action: "submitted" | "edited" | "dismissed";
  review: {
    id: number;
    node_id: string;
    user: GitHubUser;
    body: string | null;
    commit_id: string;
    submitted_at: string;
    state: "approved" | "changes_requested" | "commented" | "dismissed";
    html_url: string;
    pull_request_url: string;
    author_association: string;
  };
  pull_request: GitHubPullRequestPayload["pull_request"];
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
  changes?: any;
}

export interface GitHubPullRequestReviewCommentPayload {
  action: "created" | "edited" | "deleted";
  comment: {
    url: string;
    pull_request_review_id: number;
    id: number;
    node_id: string;
    diff_hunk: string;
    path: string;
    position: number | null;
    original_position: number;
    commit_id: string;
    original_commit_id: string;
    user: GitHubUser;
    body: string;
    created_at: string;
    updated_at: string;
    html_url: string;
    pull_request_url: string;
    author_association: string;
    reactions: any;
    line: number | null;
    original_line: number;
    side: "RIGHT" | "LEFT";
  };
  pull_request: GitHubPullRequestPayload["pull_request"];
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
  changes?: any;
}

// Workflow payloads
export interface GitHubWorkflowRunPayload {
  action: "completed" | "requested" | "in_progress";
  workflow_run: {
    id: number;
    name: string;
    node_id: string;
    head_branch: string;
    head_sha: string;
    run_number: number;
    event: string;
    status: "queued" | "in_progress" | "completed";
    conclusion:
      | "success"
      | "failure"
      | "neutral"
      | "cancelled"
      | "timed_out"
      | "action_required"
      | "stale"
      | "skipped"
      | null;
    workflow_id: number;
    url: string;
    html_url: string;
    pull_requests: any[];
    created_at: string;
    updated_at: string;
    actor: GitHubUser;
    run_attempt: number;
    run_started_at: string;
    triggering_actor: GitHubUser;
    jobs_url: string;
    logs_url: string;
    check_suite_url: string;
    artifacts_url: string;
    cancel_url: string;
    rerun_url: string;
    workflow_url: string;
    head_commit: any;
    repository: GitHubRepository;
    head_repository: GitHubRepository | null;
  };
  workflow: {
    id: number;
    node_id: string;
    name: string;
    path: string;
    state: string;
    created_at: string;
    updated_at: string;
    url: string;
    html_url: string;
    badge_url: string;
  };
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

export interface GitHubWorkflowJobPayload {
  action: "queued" | "in_progress" | "completed";
  workflow_job: {
    id: number;
    run_id: number;
    workflow_name: string;
    head_branch: string;
    run_url: string;
    run_attempt: number;
    node_id: string;
    head_sha: string;
    url: string;
    html_url: string;
    status: "queued" | "in_progress" | "completed";
    conclusion: "success" | "failure" | "cancelled" | "skipped" | null;
    created_at: string;
    started_at: string;
    completed_at: string | null;
    name: string;
    steps: Array<{
      name: string;
      status: "queued" | "in_progress" | "completed";
      conclusion: "success" | "failure" | "cancelled" | "skipped" | null;
      number: number;
      started_at?: string;
      completed_at?: string;
    }>;
    check_run_url: string;
    labels: string[];
    runner_id: number | null;
    runner_name: string | null;
    runner_group_id: number | null;
    runner_group_name: string | null;
  };
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

export interface GitHubCheckSuitePayload {
  action: "completed" | "requested" | "rerequested";
  check_suite: {
    id: number;
    node_id: string;
    head_branch: string;
    head_sha: string;
    status: "queued" | "in_progress" | "completed";
    conclusion:
      | "success"
      | "failure"
      | "neutral"
      | "cancelled"
      | "timed_out"
      | "action_required"
      | "stale"
      | "skipped"
      | null;
    url: string;
    before: string;
    after: string;
    pull_requests: any[];
    app: any;
    created_at: string;
    updated_at: string;
    latest_check_runs_count: number;
    check_runs_url: string;
    head_commit: any;
  };
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

export interface GitHubCheckRunPayload {
  action: "created" | "completed" | "rerequested" | "requested_action";
  check_run: {
    id: number;
    name: string;
    node_id: string;
    head_sha: string;
    external_id: string;
    url: string;
    html_url: string;
    details_url: string;
    status: "queued" | "in_progress" | "completed";
    conclusion:
      | "success"
      | "failure"
      | "neutral"
      | "cancelled"
      | "timed_out"
      | "action_required"
      | "stale"
      | "skipped"
      | null;
    started_at: string;
    completed_at: string | null;
    output: {
      title: string | null;
      summary: string | null;
      text: string | null;
      annotations_count: number;
      annotations_url: string;
    };
    check_suite: any;
    app: any;
    pull_requests: any[];
  };
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
  requested_action?: { identifier: string };
}

export interface GitHubStatusPayload {
  id: number;
  sha: string;
  name: string;
  target_url: string | null;
  context: string;
  description: string | null;
  state: "success" | "failure" | "error" | "pending";
  commit: any;
  branches: Array<{
    name: string;
    commit: { sha: string; url: string };
    protected: boolean;
  }>;
  created_at: string;
  updated_at: string;
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

// Social events
export interface GitHubStarPayload {
  action: "created" | "deleted";
  starred_at: string | null;
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

export interface GitHubWatchPayload {
  action: "started";
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

export interface GitHubForkPayload {
  forkee: GitHubRepository;
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

// Create/Delete events
export interface GitHubCreatePayload {
  ref: string;
  ref_type: "branch" | "tag" | "repository";
  master_branch: string;
  description: string | null;
  pusher_type: "user";
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

export interface GitHubDeletePayload {
  ref: string;
  ref_type: "branch" | "tag";
  pusher_type: "user";
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

// Admin events
export interface GitHubTeamPayload {
  action:
    | "created"
    | "deleted"
    | "edited"
    | "added_to_repository"
    | "removed_from_repository";
  team: {
    name: string;
    id: number;
    node_id: string;
    slug: string;
    description: string | null;
    privacy: "closed" | "secret";
    url: string;
    html_url: string;
    members_url: string;
    repositories_url: string;
    permission: "pull" | "push" | "admin";
  };
  changes?: any;
  repository?: GitHubRepository;
  organization: GitHubOrganization;
  sender: GitHubUser;
}

export interface GitHubOrganizationPayload {
  action:
    | "deleted"
    | "renamed"
    | "member_added"
    | "member_removed"
    | "member_invited";
  organization: GitHubOrganization;
  membership?: any;
  invitation?: any;
  changes?: any;
  sender: GitHubUser;
}

export interface GitHubMemberPayload {
  action: "added" | "removed" | "edited";
  member: GitHubUser;
  changes?: any;
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

// Content events
export interface GitHubReleasePayload {
  action:
    | "published"
    | "unpublished"
    | "created"
    | "edited"
    | "deleted"
    | "prereleased"
    | "released";
  release: {
    url: string;
    assets_url: string;
    upload_url: string;
    html_url: string;
    id: number;
    author: GitHubUser;
    node_id: string;
    tag_name: string;
    target_commitish: string;
    name: string | null;
    draft: boolean;
    prerelease: boolean;
    created_at: string;
    published_at: string | null;
    assets: any[];
    tarball_url: string;
    zipball_url: string;
    body: string | null;
  };
  changes?: any;
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

export interface GitHubPackagePayload {
  action: "published" | "updated";
  package: {
    id: number;
    name: string;
    namespace: string;
    description: string | null;
    ecosystem: string;
    package_type: string;
    html_url: string;
    created_at: string;
    updated_at: string;
    owner: GitHubUser;
    package_version: any;
    registry: any;
    visibility: "private" | "public";
  };
  repository?: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

export interface GitHubDiscussionPayload {
  action:
    | "created"
    | "edited"
    | "deleted"
    | "pinned"
    | "unpinned"
    | "locked"
    | "unlocked"
    | "transferred"
    | "category_changed"
    | "answered"
    | "unanswered"
    | "labeled"
    | "unlabeled";
  discussion: {
    repository_url: string;
    category: {
      id: number;
      node_id: string;
      name: string;
      slug: string;
      description: string;
      emoji: string;
      created_at: string;
      updated_at: string;
      is_answerable: boolean;
    };
    answer_html_url: string | null;
    answer_chosen_at: string | null;
    answer_chosen_by: GitHubUser | null;
    html_url: string;
    id: number;
    node_id: string;
    number: number;
    title: string;
    user: GitHubUser;
    state: "open" | "locked";
    locked: boolean;
    comments: number;
    created_at: string;
    updated_at: string;
    author_association: string;
    active_lock_reason: string | null;
    body: string | null;
    labels?: GitHubLabel[];
  };
  changes?: any;
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
  label?: GitHubLabel;
  answer?: any;
}

export interface GitHubDiscussionCommentPayload {
  action: "created" | "edited" | "deleted";
  comment: {
    id: number;
    node_id: string;
    html_url: string;
    parent_id: number | null;
    child_comment_count: number;
    user: GitHubUser;
    discussion_id: number;
    created_at: string;
    updated_at: string;
    author_association: string;
    body: string;
    reactions: any;
  };
  discussion: GitHubDiscussionPayload["discussion"];
  changes?: any;
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

export interface GitHubGollumPayload {
  pages?: Array<{
    page_name: string;
    title: string;
    summary: string | null;
    action: "created" | "edited";
    sha: string;
    html_url: string;
  }>;
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

export interface GitHubCommitCommentPayload {
  action: "created";
  comment: {
    url: string;
    html_url: string;
    id: number;
    node_id: string;
    user: GitHubUser;
    position: number | null;
    line: number | null;
    path: string | null;
    commit_id: string;
    created_at: string;
    updated_at: string;
    author_association: string;
    body: string;
    reactions: any;
  };
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

// Deployment events
export interface GitHubDeploymentPayload {
  deployment: {
    url: string;
    id: number;
    node_id: string;
    sha: string;
    ref: string;
    task: string;
    payload: any;
    original_environment: string;
    environment: string;
    description: string | null;
    creator: GitHubUser;
    created_at: string;
    updated_at: string;
    statuses_url: string;
    repository_url: string;
    transient_environment: boolean;
    production_environment: boolean;
  };
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

export interface GitHubDeploymentStatusPayload {
  action: "created";
  deployment_status: {
    url: string;
    id: number;
    node_id: string;
    state:
      | "error"
      | "failure"
      | "inactive"
      | "pending"
      | "success"
      | "queued"
      | "in_progress";
    creator: GitHubUser;
    description: string | null;
    environment: string;
    target_url: string | null;
    created_at: string;
    updated_at: string;
    deployment_url: string;
    repository_url: string;
  };
  deployment: GitHubDeploymentPayload["deployment"];
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
}

// Security events
export interface AuditLogEvent {
  "@timestamp": number;
  action: string;
  active: boolean;
  actor: {
    id: number;
    login: string;
    gravatar_id?: string;
    type?: string;
  } | null;
  actor_location?: { country_code?: string };
  created_at: number;
  data?: any;
  org?: string;
  permission?: string;
  repo?: string;
  user?: string;
  team?: string;
  visibility?: string;
}

export interface GitHubAuditLogWebhookPayload {
  events: AuditLogEvent[];
  organization: GitHubOrganization;
}

// Union type for all webhook payloads
export type WebhookPayload =
  | GitHubPingPayload
  | GitHubRepositoryPayload
  | GitHubPushPayload
  | GitHubPullRequestPayload
  | GitHubIssuesPayload
  | GitHubIssueCommentPayload
  | GitHubPullRequestReviewPayload
  | GitHubPullRequestReviewCommentPayload
  | GitHubWorkflowRunPayload
  | GitHubWorkflowJobPayload
  | GitHubCheckSuitePayload
  | GitHubCheckRunPayload
  | GitHubStatusPayload
  | GitHubStarPayload
  | GitHubWatchPayload
  | GitHubForkPayload
  | GitHubCreatePayload
  | GitHubDeletePayload
  | GitHubTeamPayload
  | GitHubOrganizationPayload
  | GitHubMemberPayload
  | GitHubReleasePayload
  | GitHubPackagePayload
  | GitHubDiscussionPayload
  | GitHubDiscussionCommentPayload
  | GitHubGollumPayload
  | GitHubCommitCommentPayload
  | GitHubDeploymentPayload
  | GitHubDeploymentStatusPayload
  | GitHubAuditLogWebhookPayload;

export const SUPPORTED_GITHUB_EVENTS = [
  "ping",
  "repository",
  "push",
  "pull_request",
  "pull_request_review",
  "pull_request_review_comment",
  "issues",
  "issue_comment",
  "workflow_run",
  "workflow_job",
  "check_suite",
  "check_run",
  "status",
  "star",
  "watch",
  "fork",
  "create",
  "delete",
  "team",
  "organization",
  "member",
  "release",
  "package",
  "discussion",
  "discussion_comment",
  "gollum",
  "commit_comment",
  "deployment",
  "deployment_status",
  "audit_log_streaming",
] as const;

export type GitHubWebhookEvent = (typeof SUPPORTED_GITHUB_EVENTS)[number];
