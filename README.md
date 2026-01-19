# User Management API

A robust REST API for managing users and groups with pagination, membership control, and bulk status updates. Built with NestJS, TypeORM, and MySQL.

## Quick Start

### Prerequisites
- Node.js 18+
- npm
- Docker & Docker Compose (for MySQL)

### Installation

```bash
npm install
```

## Setup & Running

### 1. Start Database

```bash
# Navigate to the vayu directory
cd /Users/yossi/dev/interviews/vayu

# Start MySQL container
docker-compose up -d
```

The database will be available at `localhost:3306` with credentials:
- Username: `user`
- Password: `password`
- Database: `user_management`

### 2. Run Migrations

```bash
# Build the project
npm run build

# Run database migrations
npx typeorm migration:run -d dist/ormconfig.js
```

This will:
- Create the `users` table with status column
- Create the `groups` table with status enum
- Create the `user_groups` join table
- Add performance indexes on email, foreign keys, and composite indexes

### 3. Start the Application

#### Development Mode (with hot reload)
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

#### Production Build
```bash
npm run build
npm run start
```

## Testing

### Run All Tests

```bash
npm test
```

Runs all unit tests and produces a summary:
```
Test Suites: 3 passed, 3 total
Tests:       19 passed, 19 total
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:cov
```

### Run End-to-End Tests

```bash
npm run test:e2e
```

## Available Endpoints

### Users
- `GET /users` - Get all users with pagination
- `PATCH /users/statuses` - Bulk update user statuses

### Groups
- `GET /groups` - Get all groups with pagination

### User-Groups
- `DELETE /user-groups/:userId/:groupId` - Remove user from group

## Testing Details

Tests cover:
- **App Controller** (1 test): Basic app setup
- **Users Controller** (2 tests): Pagination and bulk status updates
- **Groups Service** (16 tests):
  - Transaction management (commit, rollback, cleanup)
  - Status updates (ACTIVE, INACTIVE, EMPTY)
  - Group retrieval with/without users
  - Member count queries

All tests use mocks for database operations and transaction management.

## Database Schema

### Users
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
);
```

### Groups
```sql
CREATE TABLE groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  status ENUM('ACTIVE', 'INACTIVE', 'EMPTY') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_groups_status (status)
);
```

### User-Groups (Many-to-Many)
```sql
CREATE TABLE user_groups (
  user_id INT NOT NULL,
  group_id INT NOT NULL,
  PRIMARY KEY (user_id, group_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (group_id) REFERENCES groups(id),
  INDEX idx_user_groups_user_id (user_id),
  INDEX idx_user_groups_group_id (group_id),
  INDEX idx_user_groups_group_id_user_id (group_id, user_id)
);
```

## Configuration

Database configuration is centralized in `ormconfig.ts` which supports environment variables:

```typescript
// ormconfig.ts
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 3306;
const username = process.env.DB_USERNAME || 'user';
const password = process.env.DB_PASSWORD || 'password';
const database = process.env.DB_NAME || 'user_management';
```

## Development

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

## Troubleshooting

### Database Connection Issues
- Ensure Docker containers are running: `docker-compose ps`
- Check MySQL is accessible: `docker-compose logs db`

### Migration Errors
- Clear migrations: `docker-compose exec -T db mysql -u user -ppassword user_management -e "DROP DATABASE user_management; CREATE DATABASE user_management;"`
- Re-run migrations: `npx typeorm migration:run -d dist/ormconfig.js`

### Test Failures
- Ensure dependencies are installed: `npm install`
- Clear Jest cache: `npx jest --clearCache`
- Run with verbose output: `npm test -- --verbose`

## Architecture & Design

### Technology Stack
- **Framework**: NestJS 11
- **Language**: TypeScript 5.7
- **Database**: MySQL 8
- **ORM**: TypeORM 0.3
- **Validation**: class-validator & class-transformer
- **Testing**: Jest

### Project Structure

```
src/
├── common/              # Shared services and enums
│   ├── enums/          # Status enums
│   └── services/       # Pagination service
├── entities/           # TypeORM entities
│   ├── user.entity.ts
│   └── group.entity.ts
├── users/              # User module
│   ├── users.service.ts
│   ├── users.controller.ts
│   └── users.controller.spec.ts
├── groups/             # Group module
│   ├── groups.service.ts
│   ├── groups.controller.ts
│   └── groups.service.spec.ts
├── user-groups/        # User-Group association module
│   ├── user-groups.service.ts
│   └── user-groups.controller.ts
├── migrations/         # Database migrations
├── app.module.ts       # Root module
└── main.ts            # Entry point
```

### Core Features

#### 1. Get All Users with Pagination
- **Endpoint**: `GET /users?limit=10&offset=0`
- **Features**:
  - Configurable limit (max 100) and offset
  - Returns user data with associated groups
  - Total count for pagination info

#### 2. Get All Groups with Pagination
- **Endpoint**: `GET /groups?limit=10&offset=0`
- **Features**:
  - Same pagination pattern as users
  - Returns group data with associated users
  - Group status tracking (Empty/NotEmpty)

#### 3. Remove User from Group
- **Endpoint**: `DELETE /user-groups/:userId/:groupId`
- **Features**:
  - Validates user and group existence
  - Uses database transactions for atomicity
  - Automatically updates group status to "Empty" if no members remain
  - Returns current group status after removal

#### 4. Update User Statuses (BONUS)
- **Endpoint**: `PATCH /users/statuses`
- **Features**:
  - Bulk update up to 500 users in single request
  - Concurrent updates using Promise.all()
  - Validates each status against enum (pending/active/blocked)
  - Returns operation summary

## Database Schema

### Tables

**users**
```
id (INT, PK, auto-increment)
name (VARCHAR 255)
email (VARCHAR 255, UNIQUE)
status (VARCHAR 255, nullable) - Added by migration
created_at (TIMESTAMP)
```

**groups**
```
id (INT, PK, auto-increment)
name (VARCHAR 255)
status (VARCHAR 255) - Values: "Empty" or "NotEmpty"
created_at (TIMESTAMP)
```

**user_groups** (Junction Table)
```
user_id (INT, FK, PK)
group_id (INT, FK, PK)
Composite PK: (user_id, group_id)
ON DELETE CASCADE for both foreign keys
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- Docker (for MySQL database)

### Environment Setup

1. **Navigate to project directory**:
```bash
cd vayu/user-management-app
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start MySQL database**:
```bash
# From the vayu/ directory (where docker-compose.yml is located)
docker compose up -d
```

4. **Verify database is running**:
- phpMyAdmin available at `http://localhost:8080`
- Username: `user`
- Password: `password`
- Database: `user_management`

5. **Build the application**:
```bash
npm run build
```

6. **Run the application**:
```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Users
```
GET    /users                    # Get users with pagination
PATCH  /users/statuses           # Update multiple user statuses (BONUS)
```

### Groups
```
GET    /groups                   # Get groups with pagination
```

### User-Group Associations
```
DELETE /user-groups/:userId/:groupId  # Remove user from group
```

## Example Requests

### Get Users
```bash
curl -X GET "http://localhost:3000/users?limit=10&offset=0"
```

### Get Groups
```bash
curl -X GET "http://localhost:3000/groups?limit=10&offset=0"
```

### Remove User from Group
```bash
curl -X DELETE "http://localhost:3000/user-groups/1/1"
```

### Update User Statuses (BONUS)
```bash
curl -X PATCH "http://localhost:3000/users/statuses" \
  -H "Content-Type: application/json" \
  -d '{
    "users": [
      { "userId": 1, "status": "active" },
      { "userId": 2, "status": "pending" }
    ]
  }'
```

## Key Design Decisions

### 1. Transaction Safety
The `removeUserFromGroup` endpoint uses database transactions to ensure atomicity:
- All steps complete or none do
- Prevents inconsistent state (e.g., user removed but group status not updated)
- Automatic rollback on any error

### 2. Pagination Limits
- Default limit: 10
- Maximum limit: 100 (enforced in service)
- Prevents resource exhaustion from unbounded queries

### 3. Bulk Update Optimization
- Uses Promise.all() for concurrent updates
- Handles up to 500 users per request
- Validates entire batch before any updates

### 4. Type Safety
- All DTOs validated with class-validator
- Enum-based status values
- Strict TypeScript compilation

### 5. Relationships
- Many-to-many relationship via junction table
- TypeORM handles relationship loading
- Bidirectional relations for flexible queries

## Testing

### Run Unit Tests
```bash
npm run test
```

### Run Test with Coverage
```bash
npm run test:cov
```

### Run E2E Tests
```bash
npm run test:e2e
```

## Error Handling

All endpoints include comprehensive error handling:

### 400 Bad Request
- Invalid pagination parameters
- User/group not found for association operations
- Invalid status values
- Empty update arrays

### 404 Not Found
- User doesn't exist
- Group doesn't exist
- User not in specified group

### 500 Internal Server Error
- Database connection failures
- Transaction rollback on concurrent modifications

## Performance Considerations

### Pagination
- Enforced limits prevent full table scans
- Ordered results for predictable ordering
- Eager loading of relations

### Bulk Updates
- Concurrent Promise-based updates
- Scales to 500+ users
- Suitable for mass status changes

### Database Transactions
- Prevents race conditions
- Maintains referential integrity
- Automatic rollback on failures

## Building for Production

```bash
npm run build
npm run start:prod
```

The application will:
1. Run TypeORM migrations
2. Initialize database schema
3. Start listening on port 3000

## Notes

- Status column on users table is added via TypeORM migration (not in initial schema)
- Group status values are exactly "Empty" or "NotEmpty" (case-sensitive)
- User status values are lowercase: "pending", "active", "blocked"
- All timestamps are in UTC (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
