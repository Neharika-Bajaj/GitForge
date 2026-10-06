# GitForge

A Git-inspired version control system built from scratch to understand how repository management, commits, snapshots, remote synchronization, authentication, and version recovery work under the hood.

GitForge provides both a web interface for repository management and a CLI for performing version-control operations.

---

## Features

### Repository Management

- Create and manage repositories
- Public and private repositories
- View repository details
- Browse repository files
- View commit history
- Repository visibility control

### Version Control

GitForge implements Git-inspired core operations:

- `init` — Initialize a local GitForge repository
- `add` — Stage files for a commit
- `commit` — Create a repository snapshot
- `push` — Synchronize local changes with the remote repository
- `pull` — Retrieve changes from the remote repository
- `revert` — Restore the repository to an earlier commit

### Authentication & Authorization

- User signup and login
- JWT-based authentication
- Password hashing using bcrypt
- Protected API routes
- Authorization for private repositories
- Token-based access control

### Web Dashboard

The React frontend provides:

- Repository dashboard
- Repository creation
- Repository details
- File/code browsing
- Commit history
- Issue management
- User profile
- Repository visibility management

### CLI

GitForge includes a command-line interface built using `yargs`, allowing users to interact with repositories directly from the terminal.

---

## Tech Stack

### Frontend

- React.js
- Vite
- React Router
- JavaScript
- Primer React
- UIW React Heat Map

### Backend

- Node.js
- Express.js
- REST APIs
- JWT
- bcrypt
- express-validator
- yargs

### Database

- MongoDB
- Mongoose

### Version Control

- Node.js File System APIs
- Snapshot-based repository management

### DevOps

- Git
- GitHub
- GitHub Actions
- Render

---

## Architecture

```text
                         ┌─────────────────────┐
                         │        User         │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
             Web Application                    GitForge CLI
             React + Vite                       Node + Yargs
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Express Backend   │
                         │      REST APIs      │
                         └──────────┬──────────┘
                                    │
                   ┌────────────────┼────────────────┐
                   │                │                │
                   ▼                ▼                ▼
             Authentication    Repository       Issue APIs
                  JWT             APIs
                   │                │
                   └────────────────┼────────────────┘
                                    │
                                    ▼
                               MongoDB
                               Mongoose
