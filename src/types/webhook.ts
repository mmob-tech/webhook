export interface AuditLogEvent {
  action: string;
  actor: {
    login: string;
    id: number;
  };
  created_at: string;
  resource: string;
  resource_id: number;
  resource_type: string;
  // Additional fields that GitHub audit log events may include
  organization?: {
    login: string;
    id: number;
  };
  repository?: {
    name: string;
    id: number;
    full_name: string;
  };
  data?: {
    [key: string]: any;
  };
}

export interface GitHubAuditLogWebhookPayload {
  action: "audit_log_streaming";
  audit_log_events: AuditLogEvent[];
  organization: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
  installation?: {
    id: number;
  };
}

// GitHub ping event payload
export interface GitHubPingPayload {
  zen: string;
  hook_id: number;
  hook: {
    type: string;
    id: number;
    name: string;
    active: boolean;
    events: string[];
    config: {
      content_type: string;
      insecure_ssl: string;
      url: string;
    };
    updated_at: string;
    created_at: string;
    url: string;
    test_url: string;
    ping_url: string;
    deliveries_url: string;
    last_response: {
      code: number;
      status: string;
      message: string;
    };
  };
  repository?: {
    id: number;
    name: string;
    full_name: string;
    owner: {
      login: string;
      id: number;
    };
  };
  organization?: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Repository events
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
  repository: {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    owner: {
      login: string;
      id: number;
    };
    description?: string;
    homepage?: string;
    language?: string;
    created_at: string;
    updated_at: string;
  };
  organization?: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Push events
export interface GitHubPushPayload {
  ref: string;
  before: string;
  after: string;
  created: boolean;
  deleted: boolean;
  forced: boolean;
  commits: Array<{
    id: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
    committer: {
      name: string;
      email: string;
    };
    url: string;
    timestamp: string;
  }>;
  repository: {
    id: number;
    name: string;
    full_name: string;
    owner: {
      login: string;
      id: number;
    };
  };
  pusher: {
    name: string;
    email: string;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Pull Request events
export interface GitHubPullRequestPayload {
  action:
    | "opened"
    | "closed"
    | "edited"
    | "reopened"
    | "assigned"
    | "unassigned"
    | "review_requested"
    | "review_request_removed"
    | "labeled"
    | "unlabeled"
    | "synchronize";
  number: number;
  pull_request: {
    id: number;
    number: number;
    title: string;
    body: string;
    state: "open" | "closed";
    merged: boolean;
    merged_at?: string;
    head: {
      ref: string;
      sha: string;
      repo: {
        id: number;
        name: string;
        full_name: string;
      };
    };
    base: {
      ref: string;
      sha: string;
      repo: {
        id: number;
        name: string;
        full_name: string;
      };
    };
    user: {
      login: string;
      id: number;
    };
    created_at: string;
    updated_at: string;
  };
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Issues events
export interface GitHubIssuesPayload {
  action:
    | "opened"
    | "closed"
    | "edited"
    | "reopened"
    | "assigned"
    | "unassigned"
    | "labeled"
    | "unlabeled";
  issue: {
    id: number;
    number: number;
    title: string;
    body: string;
    state: "open" | "closed";
    user: {
      login: string;
      id: number;
    };
    assignee?: {
      login: string;
      id: number;
    };
    labels: Array<{
      id: number;
      name: string;
      color: string;
    }>;
    created_at: string;
    updated_at: string;
  };
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Organization events
export interface GitHubOrganizationPayload {
  action:
    | "deleted"
    | "renamed"
    | "member_added"
    | "member_removed"
    | "member_invited";
  organization: {
    login: string;
    id: number;
    description?: string;
    name?: string;
    company?: string;
    blog?: string;
    location?: string;
    email?: string;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
  };
  membership?: {
    user: {
      login: string;
      id: number;
    };
    role: "admin" | "member";
    state: "active" | "pending";
  };
  sender: {
    login: string;
    id: number;
  };
}

// Team events
export interface GitHubTeamPayload {
  action:
    | "created"
    | "deleted"
    | "edited"
    | "added_to_repository"
    | "removed_from_repository";
  team: {
    id: number;
    name: string;
    slug: string;
    description: string;
    privacy: "closed" | "secret";
    permission: "pull" | "push" | "admin";
    created_at: string;
    updated_at: string;
  };
  changes?: {
    name?: {
      from: string;
    };
    description?: {
      from: string;
    };
    privacy?: {
      from: string;
    };
    permission?: {
      from: string;
    };
  };
  repository?: {
    id: number;
    name: string;
    full_name: string;
  };
  organization: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Workflow Run events
export interface GitHubWorkflowRunPayload {
  action: "completed" | "requested" | "in_progress" | "cancelled";
  workflow_run: {
    id: number;
    name: string;
    node_id: string;
    head_branch: string;
    head_sha: string;
    path: string;
    run_number: number;
    event: string;
    display_title: string;
    status: "queued" | "in_progress" | "completed" | "cancelled";
    conclusion:
      | "success"
      | "failure"
      | "neutral"
      | "cancelled"
      | "skipped"
      | "timed_out"
      | "action_required"
      | null;
    workflow_id: number;
    check_suite_id: number;
    check_suite_node_id: string;
    url: string;
    html_url: string;
    created_at: string;
    updated_at: string;
    actor: {
      login: string;
      id: number;
      avatar_url: string;
      url: string;
    };
    run_attempt: number;
    run_started_at: string;
    triggering_actor: {
      login: string;
      id: number;
      avatar_url: string;
      url: string;
    };
    jobs_url: string;
    logs_url: string;
    check_suite_url: string;
    artifacts_url: string;
    cancel_url: string;
    rerun_url: string;
    previous_attempt_url: string | null;
    workflow_url: string;
    head_commit: {
      id: string;
      tree_id: string;
      message: string;
      timestamp: string;
      author: {
        name: string;
        email: string;
      };
      committer: {
        name: string;
        email: string;
      };
    };
    repository: {
      id: number;
      name: string;
      full_name: string;
    };
    head_repository: {
      id: number;
      name: string;
      full_name: string;
    };
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
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
  organization?: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Workflow Job events
export interface GitHubWorkflowJobPayload {
  action: "queued" | "in_progress" | "completed" | "cancelled";
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
    status: "queued" | "in_progress" | "completed" | "cancelled";
    conclusion:
      | "success"
      | "failure"
      | "neutral"
      | "cancelled"
      | "skipped"
      | "timed_out"
      | "action_required"
      | null;
    started_at: string;
    completed_at: string | null;
    name: string;
    steps: Array<{
      name: string;
      status: "queued" | "in_progress" | "completed";
      conclusion:
        | "success"
        | "failure"
        | "neutral"
        | "cancelled"
        | "skipped"
        | "timed_out"
        | "action_required"
        | null;
      number: number;
      started_at: string;
      completed_at: string | null;
    }>;
    check_run_url: string;
    labels: string[];
    runner_id: number;
    runner_name: string;
    runner_group_id: number;
    runner_group_name: string;
    created_at: string;
    updated_at: string;
  };
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
  organization?: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Check Suite events
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
      | "skipped"
      | "timed_out"
      | "action_required"
      | null;
    url: string;
    before: string;
    after: string;
    pull_requests: Array<{
      url: string;
      id: number;
      number: number;
      head: {
        ref: string;
        sha: string;
        repo: {
          id: number;
          url: string;
          name: string;
        };
      };
      base: {
        ref: string;
        sha: string;
        repo: {
          id: number;
          url: string;
          name: string;
        };
      };
    }>;
    app: {
      id: number;
      slug: string;
      node_id: string;
      owner: {
        login: string;
        id: number;
      };
      name: string;
      description: string;
      external_url: string;
      html_url: string;
      created_at: string;
      updated_at: string;
    };
    created_at: string;
    updated_at: string;
    latest_check_runs_count: number;
    check_runs_url: string;
    head_commit: {
      id: string;
      tree_id: string;
      message: string;
      timestamp: string;
      author: {
        name: string;
        email: string;
      };
      committer: {
        name: string;
        email: string;
      };
    };
  };
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
  organization?: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Check Run events
export interface GitHubCheckRunPayload {
  action: "created" | "completed" | "rerequested" | "requested_action";
  check_run: {
    id: number;
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
      | "skipped"
      | "timed_out"
      | "action_required"
      | null;
    started_at: string;
    completed_at: string | null;
    output: {
      title: string;
      summary: string;
      text: string;
      annotations_count: number;
      annotations_url: string;
    };
    name: string;
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
        | "skipped"
        | "timed_out"
        | "action_required"
        | null;
      url: string;
      before: string;
      after: string;
      pull_requests: any[];
      app: {
        id: number;
        slug: string;
        node_id: string;
        owner: {
          login: string;
          id: number;
        };
        name: string;
        description: string;
        external_url: string;
        html_url: string;
        created_at: string;
        updated_at: string;
      };
      created_at: string;
      updated_at: string;
    };
    app: {
      id: number;
      slug: string;
      node_id: string;
      owner: {
        login: string;
        id: number;
      };
      name: string;
      description: string;
      external_url: string;
      html_url: string;
      created_at: string;
      updated_at: string;
    };
    pull_requests: any[];
    created_at: string;
    updated_at: string;
  };
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
  organization?: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Release events
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
    node_id: string;
    tag_name: string;
    target_commitish: string;
    name: string;
    draft: boolean;
    author: {
      login: string;
      id: number;
    };
    prerelease: boolean;
    created_at: string;
    published_at: string;
    assets: Array<{
      url: string;
      id: number;
      node_id: string;
      name: string;
      label: string;
      uploader: {
        login: string;
        id: number;
      };
      content_type: string;
      state: string;
      size: number;
      download_count: number;
      created_at: string;
      updated_at: string;
      browser_download_url: string;
    }>;
    tarball_url: string;
    zipball_url: string;
    body: string;
  };
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
  organization?: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Star events
export interface GitHubStarPayload {
  action: "created" | "deleted";
  starred_at: string;
  repository: {
    id: number;
    name: string;
    full_name: string;
    stargazers_count: number;
    owner: {
      login: string;
      id: number;
    };
  };
  organization?: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Watch events
export interface GitHubWatchPayload {
  action: "started";
  repository: {
    id: number;
    name: string;
    full_name: string;
    watchers_count: number;
    owner: {
      login: string;
      id: number;
    };
  };
  organization?: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Fork events
export interface GitHubForkPayload {
  forkee: {
    id: number;
    name: string;
    full_name: string;
    owner: {
      login: string;
      id: number;
    };
    private: boolean;
    html_url: string;
    description: string;
    fork: boolean;
    created_at: string;
    updated_at: string;
  };
  repository: {
    id: number;
    name: string;
    full_name: string;
    forks_count: number;
    owner: {
      login: string;
      id: number;
    };
  };
  organization?: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Member events
export interface GitHubMemberPayload {
  action: "added" | "removed" | "edited";
  member: {
    login: string;
    id: number;
    avatar_url: string;
    type: string;
    site_admin: boolean;
  };
  changes?: {
    permission?: {
      from: string;
      to: string;
    };
  };
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
  organization?: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Deployment events
export interface GitHubDeploymentPayload {
  action: "created";
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
    description: string;
    creator: {
      login: string;
      id: number;
    };
    created_at: string;
    updated_at: string;
    statuses_url: string;
    repository_url: string;
  };
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
  organization?: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Deployment Status events
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
    creator: {
      login: string;
      id: number;
    };
    description: string;
    environment: string;
    target_url: string;
    created_at: string;
    updated_at: string;
    deployment_url: string;
    repository_url: string;
  };
  deployment: {
    url: string;
    id: number;
    node_id: string;
    sha: string;
    ref: string;
    task: string;
    payload: any;
    environment: string;
    description: string;
    creator: {
      login: string;
      id: number;
    };
    created_at: string;
    updated_at: string;
  };
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
  organization?: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Pull Request Review events
export interface GitHubPullRequestReviewPayload {
  action: "submitted" | "edited" | "dismissed";
  review: {
    id: number;
    node_id: string;
    user: {
      login: string;
      id: number;
    };
    body: string;
    commit_id: string;
    submitted_at: string;
    state: "approved" | "changes_requested" | "commented" | "dismissed";
    html_url: string;
    pull_request_url: string;
    author_association: string;
  };
  pull_request: {
    id: number;
    number: number;
    title: string;
    user: {
      login: string;
      id: number;
    };
    state: "open" | "closed";
    merged: boolean;
    head: {
      ref: string;
      sha: string;
    };
    base: {
      ref: string;
      sha: string;
    };
  };
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
  organization?: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Issue Comment events
export interface GitHubIssueCommentPayload {
  action: "created" | "edited" | "deleted";
  issue: {
    id: number;
    number: number;
    title: string;
    user: {
      login: string;
      id: number;
    };
    state: "open" | "closed";
    body: string;
    created_at: string;
    updated_at: string;
  };
  comment: {
    id: number;
    node_id: string;
    url: string;
    html_url: string;
    body: string;
    user: {
      login: string;
      id: number;
    };
    created_at: string;
    updated_at: string;
    author_association: string;
  };
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
  organization?: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Create events (for branches/tags)
export interface GitHubCreatePayload {
  ref: string;
  ref_type: "branch" | "tag";
  master_branch: string;
  description: string;
  pusher_type: string;
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
  organization?: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Delete events (for branches/tags)
export interface GitHubDeletePayload {
  ref: string;
  ref_type: "branch" | "tag";
  pusher_type: string;
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
  organization?: {
    login: string;
    id: number;
  };
  sender: {
    login: string;
    id: number;
  };
}

// Union type for all webhook payloads
export type WebhookPayload =
  | GitHubAuditLogWebhookPayload
  | GitHubPingPayload
  | GitHubRepositoryPayload
  | GitHubPushPayload
  | GitHubPullRequestPayload
  | GitHubIssuesPayload
  | GitHubOrganizationPayload
  | GitHubTeamPayload
  | GitHubWorkflowRunPayload
  | GitHubWorkflowJobPayload
  | GitHubCheckSuitePayload
  | GitHubCheckRunPayload
  | GitHubReleasePayload
  | GitHubStarPayload
  | GitHubWatchPayload
  | GitHubForkPayload
  | GitHubMemberPayload
  | GitHubDeploymentPayload
  | GitHubDeploymentStatusPayload
  | GitHubPullRequestReviewPayload
  | GitHubIssueCommentPayload
  | GitHubCreatePayload
  | GitHubDeletePayload;
