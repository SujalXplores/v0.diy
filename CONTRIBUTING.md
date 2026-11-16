# Contributing to v0.diy

Bug reports, fixes and features are all welcome. This guide covers local setup and what a pull request needs.

## Before you start

- For a bug, open an issue with steps to reproduce, what you expected and what happened.
- For a new feature or a large change, open an issue first so we can agree on the approach before you write code.
- Small fixes (typos, docs, obvious bugs) can go straight to a pull request.

## Local setup

You need Node.js 22+, pnpm 10+, a PostgreSQL database and a [v0 API key](https://v0.app/chat/settings/keys).

```bash
git clone https://github.com/SujalXplores/v0.diy.git
cd v0.diy
pnpm install
cp .env.example .env.local   # fill in POSTGRES_URL and AUTH_SECRET
pnpm db:migrate
pnpm dev
```

Open http://localhost:3000, create an account and add your v0 API key from the account menu. The README lists every environment variable.

## Making changes

1. Fork the repo and create a branch from `main`.
2. Make your change. If it touches the database schema, run `pnpm db:generate` and commit the new migration.
3. Run `pnpm validate`. It runs Biome, the TypeScript check and React Doctor. CI runs the same checks.
4. Open a pull request against `main`.

Useful scripts:

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm check:fix` | Format and lint with Biome, applying safe fixes |
| `pnpm typecheck` | Generate route types and run `tsc` |
| `pnpm db:studio` | Browse the database with Drizzle Studio |

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary`, for example `fix(chat): keep scroll position after streaming`. Common types are `feat`, `fix`, `docs`, `refactor` and `chore`.

## Pull requests

- Keep each pull request to one change.
- Explain what changed and why. Link the issue if there is one.
- Add a screenshot or short recording for UI changes.
- Make sure `pnpm validate` passes.

## Security

Do not open a public issue for a security problem. Email sujal.shah.dev@gmail.com instead.

## Code of conduct

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md). By taking part you agree to follow it.

## License

Contributions are released under the [MIT License](LICENSE).
