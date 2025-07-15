# GitHub Audit Webhook

This project is an AWS Lambda function that processes GitHub webhook events related to audit logs. It validates incoming event data and triggers appropriate actions based on the event type.

## Project Structure

```
webhook
├── src
│   ├── handler.ts          # Entry point for the AWS Lambda function
│   ├── types
│   │   └── github.ts       # TypeScript interfaces for GitHub webhook events
│   └── utils
│       └── validator.ts    # Utility functions for validating webhook data
├── package.json            # npm configuration file
├── tsconfig.json           # TypeScript configuration file
├── serverless.yml          # Serverless Framework configuration file
└── README.md               # Project documentation
```

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
   serverless deploy
   ```

## Usage

Once deployed, the Lambda function will listen for GitHub webhook events related to audit logs. You can configure your GitHub repository to send webhook events to the endpoint provided by the Serverless Framework after deployment.

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the project.

## License

This project is licensed under the MIT License.
