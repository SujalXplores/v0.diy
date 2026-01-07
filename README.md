```
██╗   ██╗ ██████╗       ██████╗ ██╗██╗   ██╗
██║   ██║██╔═████╗      ██╔══██╗██║╚██╗ ██╔╝
██║   ██║██║██╔██║█████╗██║  ██║██║ ╚████╔╝ 
╚██╗ ██╔╝████╔╝██║╚════╝██║  ██║██║  ╚██╔╝  
 ╚████╔╝ ╚██████╔╝      ██████╔╝██║   ██║   
  ╚═══╝   ╚═════╝       ╚═════╝ ╚═╝   ╚═╝   
```

**Open-source clone of v0.dev with AI-powered React component generation**

[![GitHub Stars](https://img.shields.io/github/stars/SujalXplores/v0.diy?style=flat-square&logo=github&labelColor=1a1a2e&color=4a4e69)](https://github.com/SujalXplores/v0.diy/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/SujalXplores/v0.diy?style=flat-square&logo=github&labelColor=1a1a2e&color=4a4e69)](https://github.com/SujalXplores/v0.diy/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/SujalXplores/v0.diy?style=flat-square&logo=github&labelColor=1a1a2e&color=4a4e69)](https://github.com/SujalXplores/v0.diy/issues)
[![License](https://img.shields.io/github/license/SujalXplores/v0.diy?style=flat-square&labelColor=1a1a2e&color=4a4e69)](LICENSE)

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[Getting Started](#getting-started) · [Features](#features) · [Tech Stack](#tech-stack) · [Project Structure](#project-structure) · [Contributing](#contributing)

---

## Overview

v0.diy is a self-hosted, open-source alternative to [v0.dev](https://v0.dev) that transforms natural language descriptions into production-ready React components. Built with the latest web technologies and designed for developers who want full control over their AI-assisted development workflow.

## Features

| Feature | Description |
|---------|-------------|
| **AI Component Generation** | Convert natural language prompts into functional React components |
| **Real-time Streaming** | Watch code generation happen live with streaming responses |
| **User Authentication** | Secure email/password authentication with NextAuth.js |
| **Rate Limiting** | 50 messages per day for authenticated users |
| **Persistent Chat History** | Conversations and generated components saved to PostgreSQL |
| **Projects Dashboard** | View and manage all your generated projects |
| **Live Preview** | Split-screen resizable layout with instant component preview |
| **Dark/Light Theme** | Full theme support with system preference detection |
| **Image Attachments** | Attach images to your prompts for context |
| **Voice Input** | Microphone support for voice-based prompts |

## Getting Started

### Prerequisites

- Node.js 22.x or later
- pnpm 9.0 or later
- PostgreSQL database (local or hosted)
- v0 API key from [v0.dev](https://v0.dev/chat/settings/keys)

### Installation

```bash
# Clone the repository
git clone https://github.com/SujalXplores/v0.diy.git
cd v0.diy

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local
```

### Environment Configuration

Create a `.env.local` file with the following variables:

```bash
# Environment
NODE_ENV=development

# Database (required)
POSTGRES_URL=postgresql://user:password@localhost:5432/v0_diy

# Authentication (required - generate with: openssl rand -base64 32)
AUTH_SECRET=your_auth_secret_here

# v0 API (required)
V0_API_KEY=your_v0_api_key_here

# Optional: Custom v0 API URL
V0_API_URL=
```

> **Note:** In development mode, if `AUTH_SECRET` is not set, a default development secret will be used automatically.

### Database Setup

```bash
# Apply database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Run migrations and build for production |
| `pnpm start` | Start production server |
| `pnpm db:generate` | Generate migration files from schema changes |
| `pnpm db:migrate` | Apply pending migrations to the database |
| `pnpm db:studio` | Open Drizzle Studio for database inspection |
| `pnpm db:push` | Push schema changes directly to the database |
| `pnpm lint` | Run Biome linter |
| `pnpm lint:fix` | Run Biome linter with auto-fix |
| `pnpm format` | Format code with Biome |
| `pnpm check` | Run Biome check (lint + format) |
| `pnpm typecheck` | Run TypeScript type checking |

## Tech Stack

### Frontend
- **React 19.2.3** — Latest React with concurrent rendering and React Compiler
- **Next.js 16.1.1** — Full-stack React framework with App Router & Turbopack
- **TypeScript 5.9.3** — Static type checking
- **Tailwind CSS 4.1.18** — Utility-first CSS framework
- **Radix UI** — Accessible UI primitives
- **Geist Font** — Typography by Vercel

### Backend & Data
- **NextAuth.js 5 (Beta)** — Authentication with Credentials provider
- **PostgreSQL** — Relational database
- **Drizzle ORM 0.45.1** — Type-safe database operations
- **Vercel Postgres** — Cloud-hosted PostgreSQL support

### AI Integration
- **v0 SDK 0.15.3** — Official v0.dev API client
- **AI SDK 6.0.11** — Streaming AI response handling
- **@v0-sdk/react 0.4.1** — React components for AI interactions

### Developer Experience
- **Biome 2.3.11** — Fast linter and formatter
- **Husky** — Git hooks for code quality
- **lint-staged** — Run linters on staged files

## Project Structure

```
v0.diy/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes & config
│   │   ├── login/           # Login page
│   │   └── register/        # Registration page
│   ├── api/                 # API routes
│   │   ├── auth/            # NextAuth endpoints
│   │   ├── chat/            # Chat API (create, fork, delete)
│   │   └── chats/           # Chat list & detail endpoints
│   ├── chats/               # Chat pages
│   └── projects/            # Projects dashboard
├── components/
│   ├── ai-elements/         # AI-specific components (prompt, response, etc.)
│   ├── chat/                # Chat interface components
│   ├── chats/               # Chat list components
│   ├── home/                # Home page components
│   ├── projects/            # Projects page components
│   ├── providers/           # React context providers
│   ├── shared/              # Shared layout components
│   └── ui/                  # Reusable UI primitives
├── contexts/                # React contexts
├── hooks/                   # Custom React hooks
├── lib/
│   ├── db/                  # Database schema, queries & migrations
│   └── ...                  # Utilities and configurations
├── types/                   # TypeScript type definitions
└── public/                  # Static assets
```

## Authentication & Rate Limits

Login is required to use the chat functionality. Users must create an account or sign in before submitting prompts.

| User Type | Max Messages/Day | Description |
|-----------|------------------|-------------|
| Registered | 50 | Email/password authenticated users |

> **Note:** Unauthenticated users will be redirected to the login page when attempting to submit a prompt. Any typed message will be preserved and restored after login.

## Contributing

Contributions are welcome. Please read our contributing guidelines before submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

### Code Quality

This project uses Biome for linting and formatting. Before submitting a PR:

```bash
pnpm check:fix  # Auto-fix linting and formatting issues
pnpm typecheck  # Ensure no TypeScript errors
```

## Testing

This project is tested with BrowserStack

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contributors

<a href="https://github.com/SujalXplores/v0.diy/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=SujalXplores/v0.diy" />
</a>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=SujalXplores/v0.diy&type=Date)](https://star-history.com/#SujalXplores/v0.diy&Date)

> **⭐ If you found this project helpful, please consider giving it a star!**
