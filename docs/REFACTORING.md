# Refactoring report

What changed in the `refactor/full-restructure` branch and why. Every item
below was found in the code audit and has been fixed unless marked
**Deferred**.

## Results

| | Before | After |
|---|---|---|
| Source lines (`ts`/`tsx`/`css`) | 10,532 | ~7,700 |
| Largest file | 734 lines (`home-client.tsx`) | 257 lines (`task-part-renderers.tsx`) |
| Files over 300 lines | 4 | 0 |
| React Doctor | 106 issues (20 errors) | 0 issues |
| Biome | 6 errors, 5 warnings | clean |
| TypeScript | `strict` | `strict` + `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUnusedLocals/Parameters`, `verbatimModuleSyntax` |

Validation: `pnpm validate` (Biome + TypeScript + React Doctor) and
`next build` pass. The flows were exercised end to end in a browser against
the dev server: sign-up, sign-in (valid and invalid), sign-out, auth
redirects, draft persistence across reloads and sign-in, image attachments,
the API-key dialog, the chats and projects pages, theme toggle, and every API
route's success and error responses. v0 generation itself was exercised with
a mocked v0 event stream (no real API key was used), covering streaming
render, the in-place URL switch, ownership recording, follow-up messages,
preview reload/fullscreen, the resizable divider, and rename / visibility /
missing-key / server-error paths.

## Bugs fixed

1. **Rename and delete in the chat selector never worked.** The header menu
   called `PATCH`/`DELETE /api/chats/:id`, which didn't exist. Both handlers
   now exist, check ownership, and delete also removes the ownership row.
2. **Duplicating a chat opened a 404.** `/api/chat/fork` never recorded
   ownership of the new chat, so opening it bounced back home. It now
   records ownership (and checks you own the source chat).
3. **Broken preview URL after a failed refresh.** When refetching chat details
   failed, the preview iframe was pointed at the string
   `Generated Chat <id>`. Failures now leave the preview untouched.
4. **Thinking sections snapped shut.** `Reasoning` auto-closed one second after
   a collapsed section was expanded. The streaming auto-close logic (never
   used here) was removed.
5. **Stale chat when switching chats.** The chat page component was reused
   across `/chats/a` → `/chats/b`, keeping the old history. It's now keyed by
   chat ID.
6. **Duplicate stream consumer on the homepage.** A hidden second
   `StreamingMessage` read the same stream (it always lost the race and
   logged "Stream is locked"). Removed.
7. **Stale closures in stream callbacks.** `StreamingMessage` captures its
   callbacks when the stream starts, so the homepage read a `null` chat ID in
   every chat event and posted ownership repeatedly. The chat ID now lives in
   a ref, and history updates are functional.
8. **Resizing over the preview got stuck.** The iframe swallowed `mousemove`/
   `mouseup`, so dragging right stopped resizing and never ended the drag.
   Iframe pointer events are disabled while dragging; the 1px handle got a
   wider grab area; keyboard and drag bounds now agree (20–60%).
9. **Theme toggle did nothing on first click with the system theme.** It
   compared `theme` (`"system"`) instead of `resolvedTheme`.
10. **API key validated before trimming.** A pasted key with whitespace was
    validated untrimmed but stored trimmed.
11. **Follow-up images ignored on the homepage.** The image button was shown
    but attachments were dropped for follow-up messages.
12. **Missing-key flow differed by page.** On the homepage a blocked
    follow-up kept the optimistic user message; now every page removes it
    and restores the input and attachments.
13. **Speech recognition recreated on every render.** Inline callbacks were
    effect dependencies. Callbacks are now read from a ref.
14. **Random React keys** (`Math.random()`) in task file lists, and
    `Object`-literal renderer lookups that a task type like `"constructor"`
    would have resolved to `Object.prototype`. Lookups now use `Map`s.
15. **`PromptInputButton` ignored its `size` prop** (operator-precedence bug).
16. **New DB connection pool on every hot reload** in development.
17. **`bcrypt.hashSync` blocked the event loop** during sign-up; now async.
18. **Sign-in/sign-up relied on catching Next's redirect** inside `try`;
    redirects now happen after the `try` and validation uses `safeParse`.
19. **Overlapping replies overwrote each other.** Sending a follow-up while a
    reply was still streaming let the earlier stream replace the newer reply
    when it finished. Streams are now finalised by message ID.
20. **Blank API keys could be "saved"** through a direct API call, leaving the
    user stuck between "a key is saved" and "set your key". They are now
    rejected before validation.

## Code smells and anti-patterns addressed

- **Monolith components**: `home-client.tsx` (734 lines, 14 `useState`s),
  `chat-selector.tsx` (586 lines, 11 `useState`s), `prompt-input.tsx` (606),
  `shared-components.tsx` (367) were split into single-purpose files.
- **Business logic in UI**: fetch calls, error parsing, history mutation,
  storage and SWR cache updates moved into hooks (`useNewChat`, `useChat`,
  `useChatConversation`, `usePromptComposer`, `useChatActions`,
  `useUserChats`, `useV0ApiKeyForm`, `usePreviewControls`) and pure modules
  (`chat-api`, `chat-history`, `prompt-draft-storage`, `message-content`).
- **Duplication**: the send/stream/error flow existed three times, the prompt
  box twice, eight copy-pasted suggestion buttons twice, the auth page shell
  twice, four near-identical dialogs, the privacy option list twice, the
  "migration missing" check twice, and the v0-client error mapping in six
  routes. Each now exists once.
- **Route boilerplate**: every route repeated session checks, body parsing and
  error formatting. Replaced by `requireUserId`, `parseJsonBody` (Zod),
  `HttpError` and `toErrorResponse`; all errors share `{ error, code? }`.
- **Unvalidated input**: request bodies were destructured from
  `request.json()` without validation; they now go through Zod schemas.
- **Hand-written API types** that didn't match v0 (`messages` on list items,
  `demo` on summaries). Types now come from `v0-sdk`, and v0's
  `experimental_content` is validated with a type guard instead of cast.
- **Booleans instead of state machines**: four `isXDialogOpen` and four
  `isXing` flags became one `openDialog` and one `pendingAction`.
- **Derived state stored in state**: `showChatInterface` is now derived from
  the history length.
- **Effects doing event work**: focus effects replaced by `autoFocus`; fetch
  in effects replaced by SWR; `setState` updaters with side effects removed.
- **`forwardRef`** replaced with React 19 ref-as-prop; `useContext` with
  `use`.
- **Magic strings** (error codes, cache keys, storage key, reset param)
  centralised as constants.
- **Error objects with a Promise in `info`**, `substr`, `any` in global types,
  non-null assertions and misspelled file names (`use-event-listner`) fixed.
- **Accessibility**: icon-only buttons (send, attach, dictate, remove image,
  account, preview controls) got accessible names; decorative SVGs are
  `aria-hidden`; the mic button exposes `aria-pressed`.
- **Supply chain**: `pnpm-workspace.yaml` now enforces a 3-day
  `minimumReleaseAge` and `trustPolicy: no-downgrade` (with two documented
  exceptions for packages already in use).

## Dead code removed

- Unused AI Elements: `actions`, `branch`, `code-block`, `image`,
  `inline-citation`, `source`, `tool`; unused UI: `badge`, `carousel`,
  `hover-card`; unused exports (`MessageContent`, `MessageAvatar`,
  `ConversationScrollButton`, `PromptInputModelSelect*`, `WebPreviewConsole`,
  `VercelIcon`, `generateUUID`, `hasAllRequiredEnvVars`, `buttonVariants`).
- `components/shared/chat-menu.tsx` (never rendered), the
  `StreamingProvider` context (its handoff was never started) and the
  handoff branches in `useChat`.
- `extractChatIdFromContent` heuristics and the cache-seeding branch in
  `useChat`, which only ran when no chat was loaded (the page redirects home
  in that case).
- The unused `ChatSDKError` surfaces (`vote`, `document`, `suggestions`,
  `history`…), the `guestRegex` check (guest users were removed by migration
  0003), and the unreferenced `/api/chat/delete` and `/api/user/api-key`
  routes.
- All five `public/*.svg` create-next-app assets and the empty `scripts/` dir.
- Unused packages: `ai`, `@ai-sdk/react`, `shiki`, `nanoid`,
  `react-syntax-highlighter` (+ types), `embla-carousel-react`,
  `@radix-ui/react-hover-card`, `@radix-ui/react-use-controllable-state`.
- The project card's "…" button, which only called `preventDefault()`.
- The chat list's "N messages" line, which was always "0 messages" because v0
  list responses don't include messages.

## Dependencies

All dependencies were upgraded to their latest stable versions (releases
younger than three days are skipped by the new release-age policy). Notable
majors: TypeScript 5.9 → 7.0 (Next 16.3 type-checks through the `tsc` CLI),
lucide-react 0.575 → 1.48, bcrypt-ts 8 → 9 (requires Node ≥ 22, now declared
in `engines`), dotenv 17 → 18, lint-staged 16 → 17, @types/node 25 → 26.
`server-only` is now a declared dependency (it was imported but only resolved
transitively), and build-only tools (`drizzle-kit`, `tsx`, `dotenv`,
`babel-plugin-react-compiler`) moved to `devDependencies`.

**Deferred**

- **`@v0-sdk/react` stays on 0.5.1 (latest 0.x).** 3.x is a different library:
  an AI SDK transport with no `StreamingMessage`, `Message` or
  `MessageBinaryFormat`. Adopting it means rebuilding the chat on AI SDK
  `useChat` and the new `v0` package, and it can only be verified against a
  real v0 account.
- **pnpm stays on 10.29.3.** pnpm 11/12 change the lockfile format, and the
  newest 10.x releases are either under three days old or fail the new trust
  policy.

## Folder structure

See the Project Structure section of the README. In short, `src/app` holds
thin route entry points, `src/features/*` own their UI, hooks and logic,
`src/server` holds everything that must stay on the server, and
`src/components` holds shared primitives.

## Known limitations (unchanged behavior)

- `/api/chats` filters v0's first page of chats (`chats.find()` default
  limit), so users with many chats may not see older ones in the list.
- The daily limit counts chats created in 24 hours, although its message
  says "messages".
- Opening `/projects` without a saved v0 key (but with existing chats)
  throws, as before; there is no route-level error UI.
