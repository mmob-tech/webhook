# GitHub Webhook Handler

This project is an AWS Lambda function that processes GitHub webhook events for comprehensive repository monitoring and automation. It validates incoming event data and triggers appropriate actions based on the event type, supporting all major GitHub webhook events.

## Project Structure

```
webhook
├── src
│   ├── handler.ts          # Entry point for the AWS Lambda function
│   ├── handler.test.ts     # Comprehensive test suite for all webhook events
│   ├── types
│   │   └── github.ts       # TypeScript interfaces for GitHub webhook events
│   └── utils
│       └── validator.ts    # Utility functions for validating webhook data
├── package.json            # npm configuration file
├── tsconfig.json           # TypeScript configuration file
├── serverless.yml          # Serverless Framework configuration file
└── README.md               # Project documentation
```

## Supported GitHub Webhook Events

This handler supports all major GitHub webhook events, organized by category:

### **Core Repository Events**

- **`ping`** - Webhook ping event for testing connectivity
- **`repository`** - Repository created, deleted, archived, etc.
- **`push`** - Code pushed to repository
- **`create`** - Branch or tag created
- **`delete`** - Branch or tag deleted
- **`fork`** - Repository forked
- **`star`** - Repository starred/unstarred
- **`watch`** - Repository watched/unwatched

### **Pull Request Events**

- **`pull_request`** - Pull request opened, closed, merged, etc.
- **`pull_request_review`** - Pull request review submitted, edited, dismissed
- **`pull_request_review_comment`** - Comments on pull request reviews

### **Issue Events**

- **`issues`** - Issue opened, closed, edited, labeled, etc.
- **`issue_comment`** - Comments on issues and pull requests

### **Code & Comments**

- **`commit_comment`** - Comments on commits
- **`status`** - Commit status updates from CI/CD systems

### **Workflow & Actions**

- **`workflow_run`** - GitHub Actions workflow runs
- **`workflow_job`** - Individual workflow job status
- **`check_suite`** - Check suite created, completed, etc.
- **`check_run`** - Individual check run status

### **Releases & Packages**

- **`release`** - Release published, edited, deleted
- **`package`** - GitHub Packages published, updated

### **Organization & Team Management**

- **`organization`** - Organization settings changed
- **`team`** - Team created, deleted, modified
- **`member`** - Organization member added, removed

### **Deployment Events**

- **`deployment`** - Deployment created
- **`deployment_status`** - Deployment status updated

### **Discussion Events**

- **`discussion`** - Repository discussion created, edited, etc.
- **`discussion_comment`** - Comments on discussions

### **Wiki & Documentation**

- **`gollum`** - Wiki page created, edited, deleted

### **Security & Audit**

- **`audit_log_streaming`** - Organization audit log events (requires special validation)

## Features

### **Comprehensive Event Processing**

- **All GitHub webhook events** supported
- **Type-safe TypeScript interfaces** for all event payloads
- **Consistent response format** for all event types
- **Detailed event information** extracted and logged

### **Robust Error Handling**

- **JSON parsing errors** handled gracefully
- **Missing headers** detection and reporting
- **Unsupported events** with helpful error messages
- **Validation failures** for special events like audit logs

### **Production-Ready**

- **Full event test coverage** with comprehensive test suite
- **AWS Lambda optimized** for serverless deployment
- **Structured logging** for monitoring and debugging
- **Scalable architecture** for high-volume webhooks

## Setup Instructions

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure AWS credentials:**
   Ensure that your AWS credentials are configured properly. You can set them up using the AWS CLI or by creating a `.env` file.

3. **Deploy the Lambda function:**
   Use the Serverless Framework to deploy the function:

   ```bash
   npm run deploy
   ```

4. **Run tests:**
   Execute the comprehensive test suite:
   ```bash
   npm test
   ```

## Usage

Once deployed, the Lambda function will listen for GitHub webhook events. You can configure your GitHub repository or organization to send webhook events to the endpoint provided by the Serverless Framework after deployment.

### **Webhook Configuration**

1. **Repository Webhooks:**

   - Go to your repository settings
   - Navigate to "Webhooks"
   - Add webhook with your Lambda endpoint URL
   - Select individual events or "Send me everything"

2. **Organization Webhooks:**
   - Go to organization settings
   - Navigate to "Webhooks"
   - Add webhook for organization-wide events
   - Configure audit log streaming if needed

### **Response Format**

All webhook events return a consistent JSON response:

```json
{
  "statusCode": 200,
  "body": {
    "message": "Event type processed successfully",
    "event_data": {
      // Relevant event information
    }
  }
}
```

### **Error Responses**

```json
{
  "statusCode": 400,
  "body": {
    "message": "Unsupported GitHub event: event_name",
    "supported_events": [
      // List of all supported events
    ]
  }
}
```

## Development

### **Adding New Event Types**

1. **Update handler.ts** - Add new event case
2. **Update types/github.ts** - Add TypeScript interfaces
3. **Add tests** - Create comprehensive test cases
4. **Update README.md** - Document the new event type

### **Testing**

The project includes a comprehensive test suite covering:

- **All supported webhook events**
- **Error handling scenarios**
- **Edge cases and validation**
- **Mock AWS Lambda context**

Run tests with:

```bash
npm test
```

### **Local Development**

```bash
# Install dependencies
npm install

# Run tests
npm test

# Type checking
npm run type-check

# Build project
npm run build
```

## Event Processing Examples

### **Pull Request Events**

```typescript
// Handles: opened, closed, merged, edited, etc.
case "pull_request":
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Pull request ${payload.action} event processed`,
      pr_number: payload.pull_request.number,
      title: payload.pull_request.title,
      action: payload.action,
    })
  };
```

### **Push Events**

```typescript
// Handles: code pushes with commit details
case "push":
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Push event processed",
      ref: payload.ref,
      commits_count: payload.commits.length,
      repository: payload.repository.full_name,
    })
  };
```

### **Workflow Events**

```typescript
// Handles: GitHub Actions workflow runs
case "workflow_run":
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Workflow ${payload.action} event processed`,
      workflow_name: payload.workflow_run.name,
      conclusion: payload.workflow_run.conclusion,
      action: payload.action,
    })
  };
```

**Note:** This webhook handler is designed for production use and includes comprehensive error handling, logging, and monitoring capabilities for enterprise GitHub environments.
