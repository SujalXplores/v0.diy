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

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[Getting Started](#getting-started) · [Features](#features) · [Tech Stack](#tech-stack) · [Contributing](#contributing)

---

## Overview

v0.diy is a self-hosted, open-source alternative to [v0.dev](https://v0.dev) that transforms natural language descriptions into production-ready React components. Built with the latest web technologies and designed for developers who want full control over their AI-assisted development workflow.

## Features

| Feature | Description |
|---------|-------------|
| **AI Component Generation** | Convert natural language prompts into functional React components |
| **Real-time Streaming** | Watch code generation happen live with streaming responses |
| **Multi-tenant Authentication** | Secure user management with NextAuth.js |
| **Persistent Chat History** | Conversations and generated components saved to PostgreSQL |
| **Live Preview** | Split-screen editor with instant component preview |
| **Responsive Design** | Fully responsive interface for desktop and mobile |

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

```bash
# AI Configuration
V0_API_KEY=your_v0_api_key_here

# Authentication (generate with: openssl rand -base64 32)
AUTH_SECRET=your_auth_secret_here

# Database
POSTGRES_URL=postgresql://user:password@localhost:5432/v0_diy
```

### Database Setup

```bash
# Apply database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Database Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm db:generate` | Generate migration files from schema changes |
| `pnpm db:migrate` | Apply pending migrations to the database |
| `pnpm db:studio` | Open Drizzle Studio for database inspection |

## Tech Stack

### Frontend
- **React 19.2.1** — Latest React with concurrent rendering
- **Next.js 16** — Full-stack React framework with App Router
- **TypeScript 5.9** — Static type checking
- **Tailwind CSS 4** — Utility-first CSS framework

### Backend & Data
- **NextAuth.js** — Authentication and session management
- **PostgreSQL** — Relational database
- **Drizzle ORM** — Type-safe database operations
- **Vercel Postgres** — Cloud-hosted PostgreSQL

### AI Integration
- **v0 SDK** — Official v0.dev API client
- **AI SDK** — Streaming AI response handling
- **@v0-sdk/react** — React components for AI interactions

## Project Structure

```
v0.diy/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                # Reusable UI primitives
│   └── ...                # Feature components
├── lib/                   # Utilities and configurations
├── db/                    # Database schema and migrations
└── public/                # Static assets
```

## Contributing

Contributions are welcome. Please read our contributing guidelines before submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Built by [Sujal Shah](https://github.com/SujalXplores)**

[![GitHub](https://img.shields.io/badge/Follow-SujalXplores-black?style=flat&logo=github)](https://github.com/SujalXplores)
[![Email](https://img.shields.io/badge/Email-sujal.shah.dev@gmail.com-red?style=flat&logo=gmail)](mailto:sujal.shah.dev@gmail.com)

> **⭐ If you found this project helpful, please consider giving it a star!**
