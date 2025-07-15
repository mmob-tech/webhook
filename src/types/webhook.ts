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

// Union type for all webhook payloads
export type WebhookPayload =
  | GitHubAuditLogWebhookPayload
  | GitHubPingPayload
  | GitHubRepositoryPayload
  | GitHubPushPayload
  | GitHubPullRequestPayload
  | GitHubIssuesPayload
  | GitHubOrganizationPayload
  | GitHubTeamPayload;
