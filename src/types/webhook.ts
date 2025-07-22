// Base interfaces for common structures
export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  type: string;
  site_admin: boolean;
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
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  default_branch: string;
  topics: string[];
  archived: boolean;
  disabled: boolean;
  visibility?: "public" | "private" | "internal";
  language?: string;
  created_at?: string;
  updated_at?: string;
  pushed_at?: string;
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
  name: string;
  color: string;
  description: string | null;
  default: boolean;
}

export interface GitHubMilestone {
  id: number;
  node_id: string;
  number: number;
  title: string;
  description: string | null;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
  due_on: string | null;
  closed_at: string | null;
}

// Audit Log Event
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
  sender: GitHubUser;
  installation?: {
    id: number;
  };
}

// Ping Event
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
  repository?: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Repository Events
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
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Push Events
export interface GitHubCommit {
  id: string;
  tree_id: string;
  distinct: boolean;
  message: string;
  timestamp: string;
  url: string;
  author: {
    name: string;
    email: string;
    username?: string;
  };
  committer: {
    name: string;
    email: string;
    username?: string;
  };
  added: string[];
  removed: string[];
  modified: string[];
}

export interface GitHubPushPayload {
  ref: string;
  before: string;
  after: string;
  created: boolean;
  deleted: boolean;
  forced: boolean;
  commits: GitHubCommit[];
  head_commit?: GitHubCommit | null;
  repository: GitHubRepository;
  pusher: {
    name: string;
    email: string;
  };
  sender: GitHubUser;
  compare: string;
}

// Pull Request Events
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
    | "synchronize"
    | "converted_to_draft"
    | "ready_for_review";
  number: number;
  pull_request: {
    id: number;
    node_id: string;
    number: number;
    title: string;
    body: string;
    state: "open" | "closed";
    draft: boolean;
    merged: boolean;
    merged_at?: string | null;
    merge_commit_sha?: string | null;
    assignee?: GitHubUser | null;
    assignees?: GitHubUser[];
    requested_reviewers?: GitHubUser[];
    requested_teams?: Array<{
      id: number;
      node_id: string;
      name: string;
      slug: string;
    }>;
    labels?: GitHubLabel[];
    milestone?: GitHubMilestone | null;
    head: {
      ref: string;
      sha: string;
      repo: {
        id: number;
        node_id: string;
        name: string;
        full_name: string;
        owner: {
          login: string;
          id: number;
        };
        private: boolean;
        html_url: string;
        description: string | null;
        fork: boolean;
        default_branch: string;
      } | null;
    };
    base: {
      ref: string;
      sha: string;
      repo: {
        id: number;
        node_id: string;
        name: string;
        full_name: string;
        owner: {
          login: string;
          id: number;
        };
        private: boolean;
        html_url: string;
        description: string | null;
        fork: boolean;
        default_branch: string;
      };
    };
    user: GitHubUser;
    author_association: string;
    auto_merge?: any | null;
    commits: number;
    additions: number;
    deletions: number;
    changed_files: number;
    comments: number;
    review_comments: number;
    maintainer_can_modify: boolean;
    mergeable?: boolean | null;
    mergeable_state?: string;
    merged_by?: GitHubUser | null;
    created_at: string;
    updated_at: string;
    closed_at?: string | null;
    html_url: string;
    url: string;
  };
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Issues Events
export interface GitHubIssuesPayload {
  action:
    | "opened"
    | "closed"
    | "edited"
    | "reopened"
    | "assigned"
    | "unassigned"
    | "labeled"
    | "unlabeled"
    | "locked"
    | "unlocked"
    | "transferred"
    | "pinned"
    | "unpinned";
  issue: {
    id: number;
    node_id: string;
    number: number;
    title: string;
    body: string;
    state: "open" | "closed";
    state_reason?: string | null;
    user: GitHubUser;
    assignee?: GitHubUser | null;
    assignees?: GitHubUser[];
    labels: GitHubLabel[];
    milestone?: GitHubMilestone | null;
    locked: boolean;
    active_lock_reason?: string | null;
    comments: number;
    author_association: string;
    created_at: string;
    updated_at: string;
    closed_at?: string | null;
    html_url: string;
    url: string;
  };
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Issue Comment Events
export interface GitHubIssueCommentPayload {
  action: "created" | "edited" | "deleted";
  issue: {
    id: number;
    node_id: string;
    number: number;
    title: string;
    user: GitHubUser;
    labels: GitHubLabel[];
    state: "open" | "closed";
    locked: boolean;
    assignee?: GitHubUser | null;
    assignees?: GitHubUser[];
    milestone?: GitHubMilestone | null;
    comments: number;
    body: string;
    closed_at?: string | null;
    created_at: string;
    updated_at: string;
    author_association: string;
    active_lock_reason?: string | null;
    state_reason?: string | null;
    // Critical property to distinguish PR comments from issue comments
    pull_request?: {
      url: string;
      html_url: string;
      diff_url: string;
      patch_url: string;
      merged_at?: string | null;
    } | null;
  };
  comment: {
    // CORRECT Issue Comment properties (not PR review comment properties)
    id: number;
    node_id: string;
    url: string;
    html_url: string;
    issue_url: string;
    body: string;
    original_line?: string | null;
    user: GitHubUser;
    created_at: string;
    updated_at: string;
    author_association: string;
    performed_via_github_app?: any | null;
    reactions?: {
      url: string;
      total_count: number;
      "+1": number;
      "-1": number;
      laugh: number;
      hooray: number;
      confused: number;
      heart: number;
      rocket: number;
      eyes: number;
    };
  };
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Organization Events
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
    node_id: string;
    url: string;
    repos_url: string;
    events_url: string;
    hooks_url: string;
    issues_url: string;
    members_url: string;
    public_members_url: string;
    avatar_url: string;
    description?: string | null;
    name?: string;
    company?: string;
    blog?: string;
    location?: string;
    email?: string;
    public_repos: number;
    public_gists?: number;
    followers: number;
    following: number;
    html_url: string;
    type: string;
    total_private_repos?: number;
    owned_private_repos?: number;
    private_gists?: number;
    disk_usage?: number;
    collaborators?: number;
    billing_email?: string;
    plan?: {
      name: string;
      space: number;
      private_repos: number;
      filled_seats?: number;
      seats?: number;
    };
    default_repository_permission?: string;
    members_can_create_repositories?: boolean;
    two_factor_requirement_enabled?: boolean;
    members_allowed_repository_creation_type?: string;
    members_can_create_public_repositories?: boolean;
    members_can_create_private_repositories?: boolean;
    members_can_create_internal_repositories?: boolean;
    members_can_create_pages?: boolean;
    members_can_create_public_pages?: boolean;
    members_can_create_private_pages?: boolean;
    public_members_count?: number;
    created_at: string;
    updated_at: string;
  };
  membership?: {
    url: string;
    state: "active" | "pending";
    role: "admin" | "member";
    organization_url: string;
    user: GitHubUser;
  };
  invitation?: {
    id: number;
    node_id: string;
    login?: string;
    email?: string;
    role: "admin" | "direct_member" | "billing_manager";
    created_at: string;
    failed_at?: string | null;
    failed_reason?: string | null;
    inviter: GitHubUser;
    team_count: number;
    invitation_teams_url: string;
  };
  changes?: {
    login?: {
      from: string;
    };
  };
  sender: GitHubUser;
}

// Team Events
export interface GitHubTeamPayload {
  action:
    | "created"
    | "deleted"
    | "edited"
    | "added_to_repository"
    | "removed_from_repository";
  team: {
    id: number;
    node_id: string;
    name: string;
    slug: string;
    description: string | null;
    privacy: "closed" | "secret";
    permission: "pull" | "push" | "admin";
    url: string;
    html_url: string;
    members_url: string;
    repositories_url: string;
    parent?: {
      id: number;
      node_id: string;
      name: string;
      slug: string;
      description: string | null;
      privacy: "closed" | "secret";
      permission: "pull" | "push" | "admin";
      url: string;
      html_url: string;
      members_url: string;
      repositories_url: string;
    } | null;
    members_count: number;
    repos_count: number;
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
    repository?: {
      permissions?: {
        from: {
          admin: boolean;
          pull: boolean;
          push: boolean;
        };
      };
    };
  };
  repository?: GitHubRepository;
  organization: GitHubOrganization;
  sender: GitHubUser;
}

// Workflow Run Events
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
    pull_requests: Array<{
      id: number;
      number: number;
      url: string;
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
    created_at: string;
    updated_at: string;
    actor: GitHubUser & {
      url: string;
    };
    run_attempt: number;
    referenced_workflows?: Array<{
      path: string;
      sha: string;
      ref?: string;
    }>;
    run_started_at: string;
    triggering_actor: GitHubUser & {
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
      node_id: string;
      name: string;
      full_name: string;
      owner: {
        login: string;
        id: number;
      };
      private: boolean;
      html_url: string;
      description: string | null;
      fork: boolean;
      default_branch: string;
    };
    head_repository: {
      id: number;
      node_id: string;
      name: string;
      full_name: string;
      owner: {
        login: string;
        id: number;
      };
      private: boolean;
      html_url: string;
      description: string | null;
      fork: boolean;
      default_branch: string;
    } | null;
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
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Workflow Job Events
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
    started_at: string | null;
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
      started_at: string | null;
      completed_at: string | null;
    }>;
    check_run_url: string;
    labels: string[];
    runner_id: number | null;
    runner_name: string | null;
    runner_group_id: number | null;
    runner_group_name: string | null;
    created_at: string;
    updated_at: string;
  };
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Check Suite Events
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
      owner: GitHubUser;
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
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Check Run Events
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
    started_at: string | null;
    completed_at: string | null;
    output: {
      title: string | null;
      summary: string | null;
      text: string | null;
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
        owner: GitHubUser;
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
      owner: GitHubUser;
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
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Release Events
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
    name: string | null;
    draft: boolean;
    author: GitHubUser;
    prerelease: boolean;
    created_at: string;
    published_at: string | null;
    assets: Array<{
      url: string;
      id: number;
      node_id: string;
      name: string;
      label: string | null;
      uploader: GitHubUser;
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
    body: string | null;
  };
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Star Events
export interface GitHubStarPayload {
  action: "created" | "deleted";
  starred_at: string | null;
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Watch Events
export interface GitHubWatchPayload {
  action: "started";
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Fork Events
export interface GitHubForkPayload {
  forkee: GitHubRepository & {
    created_at: string;
    updated_at: string;
    pushed_at: string | null;
  };
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Member Events
export interface GitHubMemberPayload {
  action: "added" | "removed" | "edited";
  member: GitHubUser & {
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
  };
  changes?: {
    permission?: {
      from: string;
      to: string;
    };
    old_permission?: {
      from: string;
    };
  };
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Deployment Events
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
    description: string | null;
    creator: GitHubUser;
    created_at: string;
    updated_at: string;
    statuses_url: string;
    repository_url: string;
    transient_environment: boolean;
    production_environment: boolean;
    performed_via_github_app?: any | null;
    auto_merge: boolean;
  };
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Deployment Status Events
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
    environment_url: string | null;
    log_url: string | null;
    created_at: string;
    updated_at: string;
    deployment_url: string;
    repository_url: string;
    performed_via_github_app?: any | null;
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
    description: string | null;
    creator: GitHubUser;
    created_at: string;
    updated_at: string;
    transient_environment: boolean;
    production_environment: boolean;
    performed_via_github_app?: any | null;
    auto_merge: boolean;
  };
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Pull Request Review Events
export interface GitHubPullRequestReviewPayload {
  action: "submitted" | "edited" | "dismissed";
  review: {
    id: number;
    node_id: string;
    user: GitHubUser;
    body: string | null;
    commit_id: string;
    submitted_at: string | null;
    state: "approved" | "changes_requested" | "commented" | "dismissed";
    html_url: string;
    pull_request_url: string;
    author_association: string;
    _links: {
      html: {
        href: string;
      };
      pull_request: {
        href: string;
      };
    };
  };
  pull_request: {
    id: number;
    node_id: string;
    number: number;
    title: string;
    user: GitHubUser;
    state: "open" | "closed";
    locked: boolean;
    assignee?: any | null;
    assignees?: any[];
    milestone?: any | null;
    merged: boolean;
    mergeable?: boolean | null;
    mergeable_state?: string;
    merged_by?: any | null;
    comments: number;
    review_comments: number;
    maintainer_can_modify: boolean;
    commits: number;
    additions: number;
    deletions: number;
    changed_files: number;
    head: {
      label: string;
      ref: string;
      sha: string;
      user: GitHubUser;
      repo: {
        id: number;
        node_id: string;
        name: string;
        full_name: string;
        owner: {
          login: string;
          id: number;
        };
        private: boolean;
        html_url: string;
        description: string | null;
        fork: boolean;
        default_branch: string;
      } | null;
    };
    base: {
      label: string;
      ref: string;
      sha: string;
      user: GitHubUser;
      repo: {
        id: number;
        node_id: string;
        name: string;
        full_name: string;
        owner: {
          login: string;
          id: number;
        };
        private: boolean;
        html_url: string;
        description: string | null;
        fork: boolean;
        default_branch: string;
      };
    };
    author_association: string;
    auto_merge?: any | null;
    draft: boolean;
  };
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Pull Request Review Comment Events
export interface GitHubPullRequestReviewCommentPayload {
  action: "created" | "edited" | "deleted";
  comment: {
    id: number;
    node_id: string;
    url: string;
    diff_hunk: string;
    path: string;
    position?: number | null;
    original_position?: number | null;
    commit_id: string;
    original_commit_id: string;
    in_reply_to_id?: number | null;
    body: string;
    user: GitHubUser;
    created_at: string;
    updated_at: string;
    html_url: string;
    pull_request_url: string;
    author_association: string;
    _links: {
      self: {
        href: string;
      };
      html: {
        href: string;
      };
      pull_request: {
        href: string;
      };
    };
    line?: number | null;
    original_line?: number | null;
    start_line?: number | null;
    original_start_line?: number | null;
    start_side?: "LEFT" | "RIGHT" | null;
    side?: "LEFT" | "RIGHT";
    subject_type?: "line" | "file";
    reactions?: {
      url: string;
      total_count: number;
      "+1": number;
      "-1": number;
      laugh: number;
      hooray: number;
      confused: number;
      heart: number;
      rocket: number;
      eyes: number;
    };
  };
  pull_request: {
    id: number;
    node_id: string;
    number: number;
    title: string;
    user: GitHubUser;
    state: "open" | "closed";
    locked: boolean;
    assignee?: any | null;
    assignees?: any[];
    milestone?: any | null;
    merged: boolean;
    mergeable?: boolean | null;
    mergeable_state?: string;
    merged_by?: any | null;
    comments: number;
    review_comments: number;
    maintainer_can_modify: boolean;
    commits: number;
    additions: number;
    deletions: number;
    changed_files: number;
    head: {
      label: string;
      ref: string;
      sha: string;
      user: GitHubUser;
      repo: {
        id: number;
        node_id: string;
        name: string;
        full_name: string;
        owner: {
          login: string;
          id: number;
        };
        private: boolean;
        html_url: string;
        description: string | null;
        fork: boolean;
        default_branch: string;
      } | null;
    };
    base: {
      label: string;
      ref: string;
      sha: string;
      user: GitHubUser;
      repo: {
        id: number;
        node_id: string;
        name: string;
        full_name: string;
        owner: {
          login: string;
          id: number;
        };
        private: boolean;
        html_url: string;
        description: string | null;
        fork: boolean;
        default_branch: string;
      };
    };
    author_association: string;
    auto_merge?: any | null;
    draft: boolean;
  };
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Create Events (for branches/tags)
export interface GitHubCreatePayload {
  ref: string;
  ref_type: "branch" | "tag";
  master_branch: string;
  description: string | null;
  pusher_type: string;
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Delete Events (for branches/tags)
export interface GitHubDeletePayload {
  ref: string;
  ref_type: "branch" | "tag";
  pusher_type: string;
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Commit Comment Events
export interface GitHubCommitCommentPayload {
  action: "created";
  comment: {
    id: number;
    node_id: string;
    url: string;
    html_url: string;
    body: string;
    path?: string | null;
    position?: number | null;
    line?: number | null;
    commit_id: string;
    user: GitHubUser;
    created_at: string;
    updated_at: string;
    author_association: string;
  };
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Discussion Events
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
    | "unanswered";
  discussion: {
    id: number;
    node_id: string;
    number: number;
    title: string;
    user: GitHubUser;
    category: {
      id: number;
      node_id: string;
      repository_id: number;
      emoji: string;
      name: string;
      description: string;
      created_at: string;
      updated_at: string;
      slug: string;
      is_answerable: boolean;
    };
    answer_html_url?: string | null;
    answer_chosen_at?: string | null;
    answer_chosen_by?: GitHubUser | null;
    html_url: string;
    state: "open" | "locked";
    state_reason?: "resolved" | "outdated" | "duplicate" | "reopened" | null;
    locked: boolean;
    comments: number;
    created_at: string;
    updated_at: string;
    author_association: string;
    active_lock_reason?: string | null;
    body: string;
    reactions?: {
      url: string;
      total_count: number;
      "+1": number;
      "-1": number;
      laugh: number;
      hooray: number;
      confused: number;
      heart: number;
      rocket: number;
      eyes: number;
    };
    timeline_url: string;
    repository_url: string;
    labels?: GitHubLabel[];
  };
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Discussion Comment Events
export interface GitHubDiscussionCommentPayload {
  action: "created" | "edited" | "deleted";
  comment: {
    id: number;
    node_id: string;
    html_url: string;
    parent_id?: number | null;
    child_comment_count: number;
    body: string;
    user: GitHubUser;
    created_at: string;
    updated_at: string;
    author_association: string;
    reactions?: {
      url: string;
      total_count: number;
      "+1": number;
      "-1": number;
      laugh: number;
      hooray: number;
      confused: number;
      heart: number;
      rocket: number;
      eyes: number;
    };
    discussion_id: number;
    replies?: Array<{
      id: number;
      node_id: string;
      html_url: string;
      parent_id: number;
      child_comment_count: number;
      body: string;
      user: GitHubUser;
      created_at: string;
      updated_at: string;
      author_association: string;
    }>;
  };
  discussion: {
    id: number;
    node_id: string;
    number: number;
    title: string;
    user: GitHubUser;
    category: {
      id: number;
      node_id: string;
      repository_id: number;
      emoji: string;
      name: string;
      description: string;
      created_at: string;
      updated_at: string;
      slug: string;
      is_answerable: boolean;
    };
    html_url: string;
    state: "open" | "locked";
    locked: boolean;
    comments: number;
    created_at: string;
    updated_at: string;
    author_association: string;
    active_lock_reason?: string | null;
    body: string;
  };
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Gollum (Wiki) Events
export interface GitHubGollumPayload {
  pages: Array<{
    page_name: string;
    title: string;
    summary?: string | null;
    action: "created" | "edited";
    sha: string;
    html_url: string;
  }>;
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Package Events
export interface GitHubPackagePayload {
  action: "published" | "updated";
  package: {
    id: number;
    name: string;
    namespace: string;
    description: string | null;
    ecosystem: "npm" | "maven" | "rubygems" | "docker" | "nuget" | "container";
    package_type:
      | "npm"
      | "maven"
      | "rubygems"
      | "docker"
      | "nuget"
      | "container";
    html_url: string;
    created_at: string;
    updated_at: string;
    owner: GitHubUser;
    package_version: {
      id: number;
      version: string;
      summary: string | null;
      name: string;
      description: string | null;
      body?: string;
      body_html?: string;
      release?: {
        url: string;
        html_url: string;
        id: number;
        tag_name: string;
        target_commitish: string;
        name: string | null;
        draft: boolean;
        prerelease: boolean;
        created_at: string;
        published_at: string | null;
      };
      manifest?: string;
      html_url: string;
      tag_name?: string;
      target_commitish?: string;
      target_oid?: string;
      draft?: boolean;
      prerelease?: boolean;
      created_at: string;
      updated_at: string;
      metadata?: Array<{
        package_type: string;
        container?: {
          tags: string[];
        };
        docker?: {
          tag?: string[];
        };
      }>;
      package_files?: Array<{
        download_url: string;
        id: number;
        name: string;
        sha256: string | null;
        sha1: string | null;
        md5: string | null;
        content_type: string;
        state: string;
        size: number;
        created_at: string;
        updated_at: string;
      }>;
      author: GitHubUser;
      source_url?: string;
      installation_command?: string;
    };
    registry: {
      about_url: string | null;
      name: string;
      type: string;
      url: string;
      vendor: string | null;
    };
    visibility: "private" | "public";
  };
  repository?: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Status Events
export interface GitHubStatusPayload {
  id: number;
  sha: string;
  name: string;
  target_url?: string | null;
  context: string;
  description?: string | null;
  state: "error" | "failure" | "pending" | "success";
  commit: {
    sha: string;
    node_id: string;
    commit: {
      author: {
        name: string;
        email: string;
        date: string;
      };
      committer: {
        name: string;
        email: string;
        date: string;
      };
      message: string;
      tree: {
        sha: string;
        url: string;
      };
      url: string;
      comment_count: number;
      verification?: {
        verified: boolean;
        reason: string;
        signature?: string | null;
        payload?: string | null;
      };
    };
    url: string;
    html_url: string;
    comments_url: string;
    author: GitHubUser | null;
    committer: GitHubUser | null;
    parents: Array<{
      sha: string;
      url: string;
      html_url: string;
    }>;
  };
  branches: Array<{
    name: string;
    commit: {
      sha: string;
      url: string;
    };
    protected: boolean;
  }>;
  created_at: string;
  updated_at: string;
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Milestone Events
export interface GitHubMilestonePayload {
  action: "created" | "closed" | "opened" | "edited" | "deleted";
  milestone: GitHubMilestone & {
    creator: GitHubUser;
    open_issues: number;
    closed_issues: number;
    url: string;
    html_url: string;
    labels_url: string;
  };
  changes?: {
    description?: {
      from: string;
    };
    due_on?: {
      from: string;
    };
    title?: {
      from: string;
    };
  };
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Dependabot Alert Events
export interface GitHubDependabotAlertPayload {
  action: "created" | "dismissed" | "fixed" | "reintroduced" | "reopened";
  alert: {
    number: number;
    state: "dismissed" | "fixed" | "open";
    dependency: {
      package: {
        ecosystem: string;
        name: string;
      };
      manifest_path: string;
      scope: "development" | "runtime" | null;
    };
    security_advisory: {
      ghsa_id: string;
      cve_id?: string | null;
      summary: string;
      description: string;
      vulnerabilities: Array<{
        package: {
          ecosystem: string;
          name: string;
        };
        severity: "low" | "medium" | "high" | "critical";
        vulnerable_version_range: string;
        first_patched_version?: {
          identifier: string;
        } | null;
      }>;
      severity: "low" | "medium" | "high" | "critical";
      cvss: {
        vector_string?: string | null;
        score: number;
      };
      cwes: Array<{
        cwe_id: string;
        name: string;
      }>;
      identifiers: Array<{
        value: string;
        type: string;
      }>;
      references: Array<{
        url: string;
      }>;
      published_at: string;
      updated_at: string;
      withdrawn_at?: string | null;
    };
    security_vulnerability: {
      package: {
        ecosystem: string;
        name: string;
      };
      severity: "low" | "medium" | "high" | "critical";
      vulnerable_version_range: string;
      first_patched_version?: {
        identifier: string;
      } | null;
    };
    url: string;
    html_url: string;
    created_at: string;
    updated_at: string;
    dismissed_at?: string | null;
    dismissed_by?: GitHubUser | null;
    dismissed_reason?:
      | "fix_started"
      | "inaccurate"
      | "no_bandwidth"
      | "not_used"
      | "tolerable_risk"
      | null;
    dismissed_comment?: string | null;
    fixed_at?: string | null;
    auto_dismissed_at?: string | null;
  };
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Public Events
export interface GitHubPublicPayload {
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  sender: GitHubUser;
}

// Define the main WebhookPayload union type
export type WebhookPayload =
  | GitHubAuditLogWebhookPayload
  | GitHubPingPayload
  | GitHubRepositoryPayload
  | GitHubPushPayload
  | GitHubPullRequestPayload
  | GitHubIssuesPayload
  | GitHubIssueCommentPayload
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
  | GitHubPullRequestReviewCommentPayload
  | GitHubCreatePayload
  | GitHubDeletePayload
  | GitHubCommitCommentPayload
  | GitHubDiscussionPayload
  | GitHubDiscussionCommentPayload
  | GitHubGollumPayload
  | GitHubPackagePayload
  | GitHubStatusPayload
  | GitHubMilestonePayload
  | GitHubPublicPayload
  | GitHubDependabotAlertPayload;

// GitHub webhook event type mapping
export type GitHubWebhookEvent =
  | "audit_log_streaming"
  | "ping"
  | "repository"
  | "push"
  | "pull_request"
  | "pull_request_review"
  | "pull_request_review_comment"
  | "issues"
  | "issue_comment"
  | "commit_comment"
  | "create"
  | "delete"
  | "fork"
  | "gollum"
  | "member"
  | "milestone"
  | "organization"
  | "package"
  | "public"
  | "release"
  | "star"
  | "status"
  | "team"
  | "watch"
  | "workflow_job"
  | "workflow_run"
  | "check_run"
  | "check_suite"
  | "deployment"
  | "deployment_status"
  | "discussion"
  | "discussion_comment"
  | "dependabot_alert";

/**
 * Helper function to determine webhook event type from payload
 * @param payload - The webhook payload
 * @returns The GitHub webhook event type or null if unrecognized
 */
export function getWebhookEventType(
  payload: WebhookPayload
): GitHubWebhookEvent | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  // Check for specific identifying properties in order of specificity
  if ("alert" in payload && "security_advisory" in payload.alert) {
    return "dependabot_alert";
  }

  if (
    "audit_log_events" in payload &&
    Array.isArray(payload.audit_log_events)
  ) {
    return "audit_log_streaming";
  }

  if (
    "zen" in payload &&
    "hook_id" in payload &&
    typeof payload.zen === "string"
  ) {
    return "ping";
  }

  if (
    "ref" in payload &&
    "commits" in payload &&
    Array.isArray(payload.commits)
  ) {
    return "push";
  }

  if ("pull_request" in payload && "action" in payload) {
    if ("review" in payload) return "pull_request_review";
    if ("comment" in payload && "diff_hunk" in payload.comment)
      return "pull_request_review_comment";
    return "pull_request";
  }

  if ("issue" in payload) {
    if ("comment" in payload) return "issue_comment";
    if ("action" in payload) return "issues";
  }

  if ("comment" in payload && "commit_id" in payload.comment) {
    return "commit_comment";
  }

  if ("discussion" in payload) {
    if ("comment" in payload) return "discussion_comment";
    return "discussion";
  }

  if ("workflow_run" in payload) return "workflow_run";
  if ("workflow_job" in payload) return "workflow_job";
  if ("check_suite" in payload) return "check_suite";
  if ("check_run" in payload) return "check_run";
  if ("release" in payload) return "release";
  if ("forkee" in payload) return "fork";
  if ("starred_at" in payload) return "star";
  if ("milestone" in payload && "action" in payload) return "milestone";

  if (
    "action" in payload &&
    payload.action === "started" &&
    "repository" in payload
  ) {
    return "watch";
  }

  if ("deployment" in payload) {
    if ("deployment_status" in payload) return "deployment_status";
    return "deployment";
  }

  if ("member" in payload) return "member";
  if ("team" in payload) return "team";
  if ("package" in payload) return "package";
  if ("pages" in payload && Array.isArray(payload.pages)) return "gollum";

  if ("ref_type" in payload && "ref" in payload) {
    if ("action" in payload && payload.action === "deleted") return "delete";
    return "create";
  }

  if (
    "organization" in payload &&
    "action" in payload &&
    !("repository" in payload)
  ) {
    return "organization";
  }

  if ("repository" in payload && "action" in payload) {
    // Check if it's a public event (when a private repo goes public)
    if (payload.action === "publicized") return "public";
    return "repository";
  }

  if ("state" in payload && "sha" in payload && "context" in payload) {
    return "status";
  }

  // Check for public event (no action field, just repository going public)
  if (
    "repository" in payload &&
    !("action" in payload) &&
    !("ref" in payload)
  ) {
    return "public";
  }

  return null;
}
