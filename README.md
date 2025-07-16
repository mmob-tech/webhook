# GitHub Webhook Handler

This project is an AWS Lambda function that processes GitHub webhook events for comprehensive repository monitoring and automation. It validates incoming event data and triggers appropriate actions based on the event type, supporting all major GitHub webhook events with **secure signature validation**.

## Project Structure

```
webhook
├── src
│   ├── handler.ts          # Entry point for the AWS Lambda function
│   ├── handler.test.ts     # Comprehensive test suite for all webhook events
│   ├── types
│   │   └── github.ts       # TypeScript interfaces for GitHub webhook events
│   └── utils
│       ├── validator.ts    # Utility functions for validating webhook data
│       └── signature.ts    # Webhook signature verification utilities
├── package.json            # npm configuration file
├── tsconfig.json           # TypeScript configuration file
├── serverless.yml          # Serverless Framework configuration file
├── .env            # Environment variable template
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

## Setup Instructions

### **1. Prerequisites**

- Node.js 20.x or later
- AWS CLI configured
- Serverless Framework installed globally

### **2. Install Dependencies**

```bash
npm install
```

### **3. Environment Configuration**

Create a `.env` file for local development:

```bash
# Copy the example file
cp .env.example .env

# Edit the file with your values
GITHUB_WEBHOOK_SECRET=your-github-secret-webhook
```

**Generate a secure webhook secret:**

```bash
# Use openssl to generate a secure random string
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### **4. AWS Configuration**

```bash
# Set environment variable for deployment
export GITHUB_WEBHOOK_SECRET="your-super-secret-webhook-key-here"
```

### **5. Deploy the Lambda Function**

```bash
# Deploy to AWS
npm run deploy

```

### **6. Test the Deployment**

```bash
# Run comprehensive test suite
npm test

# Run tests with coverage
npm run test:coverage

# Test specific event types
npm test -- --testNamePattern="Pull Request"
```

## GitHub Webhook Configuration

### **Repository Webhooks**

1. **Navigate to Repository Settings**

   - Go to your repository on GitHub
   - Click on "Settings" tab
   - Select "Webhooks" from the left sidebar

2. **Add New Webhook**

   - Click "Add webhook"
   - **Payload URL**: Your Lambda endpoint (from `serverless deploy` output)
   - **Content type**: `application/json`
   - **Secret**: Enter your webhook secret (same as `GITHUB_WEBHOOK_SECRET`)
   - **SSL verification**: ✅ Enable SSL verification
   - **Which events**: Select individual events or "Send me everything"

3. **Event Selection Examples**
   ```
   Repository events: repository, push, create, delete, fork, star, watch
   Pull Request events: pull_request, pull_request_review, pull_request_review_comment
   Issue events: issues, issue_comment
   Workflow events: workflow_run, workflow_job, check_suite, check_run
   ```

### **Organization Webhooks**

1. **Navigate to Organization Settings**

   - Go to your organization on GitHub
   - Click on "Settings" tab
   - Select "Webhooks" from the left sidebar

2. **Configure Organization-Wide Events**
   - Follow same setup as repository webhooks
   - Additional events: `organization`, `team`, `member`
   - **Audit log streaming**: Enable for `audit_log_streaming` events

### **Webhook Security Configuration**

```json
{
  "name": "GitHub Webhook Handler",
  "url": "https://your-api-gateway-url.amazonaws.com/dev/webhook",
  "content_type": "application/json",
  "secret": "your-super-secret-webhook-key-here",
  "insecure_ssl": false,
  "events": ["push", "pull_request", "issues", "workflow_run"]
}
```

## Security Implementation

### **Signature Validation Process**

1. **GitHub generates signature** using your webhook secret
2. **Signature sent in header** as `X-Hub-Signature-256`
3. **Lambda validates signature** using HMAC-SHA256
4. **Timing-safe comparison** prevents timing attacks
5. **Request rejected** if signature doesn't match

### **Signature Validation Code**

```typescript
// Verify GitHub webhook signature
const verifyGitHubSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  try {
    const expectedSignature = `sha256=${crypto
      .createHmac("sha256", secret)
      .update(payload, "utf8")
      .digest("hex")}`;

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    return false;
  }
};
```

### **Security Best Practices**

1. **🔐 Use Strong Secrets**

   - Generate cryptographically secure random strings (32+ characters)
   - Use base64 encoding for easy handling
   - Rotate secrets regularly

2. **🛡️ Secure Secret Storage**

   - Use AWS Secrets Manager for production
   - Use AWS Systems Manager Parameter Store for staging
   - Never commit secrets to version control

3. **🔍 Monitor Security Events**

   - Log all signature validation failures
   - Set up CloudWatch alarms for repeated failures
   - Monitor for unusual request patterns

4. **🚨 Incident Response**
   - Rotate webhook secrets if compromised
   - Update both GitHub and Lambda configuration
   - Review logs for any unauthorized access

## Response Format

### **Successful Responses**

```json
{
  "statusCode": 200,
  "body": {
    "message": "Event type processed successfully",
    "event_data": {
      "repository": "my-org/test-repo",
      "action": "opened",
      "details": "..."
    }
  }
}
```

### **Error Responses**

**Missing Signature:**

```json
{
  "statusCode": 401,
  "body": {
    "message": "Missing signature header"
  }
}
```

**Invalid Signature:**

```json
{
  "statusCode": 401,
  "body": {
    "message": "Invalid signature"
  }
}
```

**Unsupported Event:**

```json
{
  "statusCode": 400,
  "body": {
    "message": "Unsupported GitHub event: event_name",
    "supported_events": [
      "ping",
      "repository",
      "push",
      "pull_request",
      "issues",
      "..."
    ]
  }
}
```

**Configuration Error:**

```json
{
  "statusCode": 500,
  "body": {
    "message": "Webhook secret not configured"
  }
}
```

## Development

### **Adding New Event Types**

1. **Update handler.ts** - Add new event case with signature validation
2. **Update types/github.ts** - Add TypeScript interfaces
3. **Add comprehensive tests** - Include signature validation tests
4. **Update README.md** - Document the new event type

### **Testing with Signatures**

```typescript
// Test pattern for all webhook events
const body = JSON.stringify(payload);
const signature = generateWebhookSignature(body, testSecret);

mockEvent.headers["X-GitHub-Event"] = "event_name";
mockEvent.headers["X-Hub-Signature-256"] = signature;
mockEvent.body = body;

await webhookHandler(mockEvent, mockContext, mockCallback);
```

### **Local Development**

```bash
# Install dependencies
npm install

# Run tests with signature validation
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Build project
npm run build

# Local development with serverless-offline
serverless offline
```

### **Testing Webhook Signatures Locally**

```bash
# Test signature generation
node -e "
const crypto = require('crypto');
const payload = JSON.stringify({test: 'data'});
const secret = 'your-secret';
const signature = 'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex');
console.log('Signature:', signature);
"
```

## Event Processing Examples

### **Pull Request Events (with Security)**

```typescript
// Signature validation happens before event processing
case "pull_request":
  await processPullRequestEvent(payload as GitHubPullRequestPayload);
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

### **Push Events (with Security)**

```typescript
// All events require valid signatures
case "push":
  await processPushEvent(payload as GitHubPushPayload);
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

### **Workflow Events (with Security)**

```typescript
// Secure workflow event processing
case "workflow_run":
  await processWorkflowRunEvent(payload as GitHubWorkflowRunPayload);
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

## Monitoring and Logging

### **CloudWatch Metrics**

The handler automatically logs:

- **Successful webhook processing** with event details
- **Signature validation failures** with source IP
- **Processing errors** with full error context
- **Performance metrics** for each event type

### **Log Examples**

```
INFO: Webhook signature validated successfully
INFO: Received GitHub webhook event: pull_request
INFO: Processing pull request opened event
INFO: Pull request #123 opened in my-org/test-repo

ERROR: Invalid webhook signature from IP: 192.168.1.1
ERROR: Missing X-Hub-Signature-256 header
ERROR: Webhook secret not configured
```

### **Alerting Setup**

```yaml
# CloudWatch Alarms
SignatureValidationFailures:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: GitHub-Webhook-Invalid-Signatures
    MetricName: SignatureValidationFailures
    Threshold: 5
    ComparisonOperator: GreaterThanThreshold
    EvaluationPeriods: 2
    Period: 300
```

## Troubleshooting

### **Common Issues**

1. **Signature Validation Failures**

   - Verify webhook secret matches in GitHub and Lambda
   - Check for trailing whitespace in secret
   - Ensure content-type is `application/json`

2. **Missing Environment Variables**

   - Verify `GITHUB_WEBHOOK_SECRET` is set
   - Check serverless.yml environment configuration
   - Validate AWS parameter store/secrets manager setup

3. **Deployment Issues**

   - Ensure AWS credentials are configured
   - Check IAM permissions for Lambda execution
   - Verify API Gateway configuration

4. **Testing Issues**
   - Use correct signature generation in tests
   - Verify test secret matches handler expectations
   - Check mock setup for all required headers

### **Debug Commands**

```bash
# Check environment variables
serverless info

# View Lambda logs
serverless logs -f webhookHandler

# Test specific webhook event
curl -X POST https://yyk1br4jof.execute-api.eu-west-2.amazonaws.com/dev/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: ping" \
  -H "X-Hub-Signature-256: sha256=your-signature" \
  -d '{"zen":"test"}'
```

### **Security Considerations**

- Never commit webhook secrets to version control
- Test signature validation for all new event types
- Follow secure coding practices
- Review security implications of changes

**🔒 Security Notice:** This webhook handler implements GitHub's recommended security practices including HMAC-SHA256 signature validation and timing-safe comparison. It's designed for production use in enterprise environments with comprehensive error handling, logging, and monitoring capabilities.

**⚠️ Important:** Always use HTTPS endpoints and never expose webhook secrets. Rotate secrets regularly and monitor for unauthorized access attempts.
