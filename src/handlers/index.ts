// Export all processing functions from modular files
export * from "./audit";
export * from "./pull-request";
export * from "./repository";
export * from "./social";
export * from "./workflow";

// Re-export from admin-content for backward compatibility
export {
  processCommitCommentEvent,
  processDeploymentEvent,
  processDeploymentStatusEvent,
  processDiscussionCommentEvent,
  processDiscussionEvent,
  processGollumEvent,
  processMemberEvent,
  processOrganizationEvent,
  processPackageEvent,
  processReleaseEvent,
  processTeamEvent,
} from "../processors/admin-content";
