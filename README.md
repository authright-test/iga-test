# GitHub Access Control

GitHub Access Control is an Enterprise Identity Governance and Administration (IGA) solution for GitHub organizations, delivered as a GitHub App. It provides enhanced access control, auditability, and policy enforcement across GitHub organizations and repositories.

## Features

- **Role-Based Access Control (RBAC)**: Define custom roles and permissions for fine-grained access control
- **Policy Enforcement**: Create and enforce access control policies across repositories
- **Audit Logging**: Comprehensive audit trails for all access-related events
- **Dashboard & Reporting**: Visibility into permissions and policy compliance
- **Workflow Automation**: Automate access-related tasks like user onboarding/offboarding

## Architecture

The application consists of:

- **Backend**: Node.js (Express) API with MySQL database and Redis caching
- **Frontend**: React UI with Chakra UI components
- **GitHub Integration**: GitHub App for authorization and webhooks

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [MySQL](https://www.mysql.com/) (v8+)
- [Redis](https://redis.io/) (v6+)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (for containerized deployment)
- [GitHub App](https://docs.github.com/en/developers/apps/getting-started-with-apps/about-apps) registration

## Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/github-access-control.git
   cd github-access-control
   ```

2. **Environment Configuration**

   Copy the example environment file and update with your settings:

   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies**

   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

4. **Create GitHub App**

   1. Create a new GitHub App in your GitHub account
   2. Configure the necessary permissions (repo, org, etc.)
   3. Generate a private key
   4. Configure webhook URL
   5. Update the `.env` file with your GitHub App credentials

5. **Start Development Servers**

   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd ../frontend
   npm start
   ```

## Production Deployment

The application is containerized and can be deployed using Docker Compose:

```bash
# Build and start all services
docker-compose up -d --build
```

## Key Features

### Audit Logging System

The audit logging system provides comprehensive activity tracking and security auditing, recording all actions performed within GitHub organizations and repositories:

- **Real-time Activity Tracking**: Automatically logs all key operations including repository creation/deletion, team member changes, permission modifications, and policy enforcement actions
- **Detailed Log Information**: Records operation type, resource information, executing user, and detailed contextual data
- **Advanced Search & Filtering**: Filter logs by action type, resource type, date range, and keywords
- **Statistical Analysis**: Provides activity trends, user behavior, and policy enforcement statistics
- **Export Capability**: Export audit logs to CSV format for compliance reporting and external analysis
- **Dashboard Integration**: Displays recent important activities on the main dashboard for immediate insights

#### Audit Log Data Model

- `id`: Unique log record identifier
- `userId`: ID of the user performing the action (can be null for system operations)
- `organizationId`: Organization ID
- `action`: Performed operation (e.g., repository_created, member_added, policy_enforced)
- `resourceType`: Resource type (e.g., repository, user, team, organization, policy)
- `resourceId`: Resource identifier
- `details`: Detailed JSON information about the operation
- `createdAt`: Record creation timestamp
- `updatedAt`: Record update timestamp

## Documentation

For more details on installation, configuration, and usage, refer to the following documentation:

- [Installation Guide](docs/installation.md)
- [API Documentation](docs/api.md)
- [User Guide](docs/user-guide.md)
- [Developer Guide](docs/developer-guide.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 