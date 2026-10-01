import { CHAT_METADATA, importChat } from "@/server/chats/import-chat";
import { authorizeUserRoute } from "@/server/chats/route-auth";
import { importRepoBodySchema } from "@/server/chats/schemas";
import { parseJsonBody } from "@/server/http/request";
import { handleRoute } from "@/server/http/route";
import { unwrapV0 } from "@/server/v0/client";

export const maxDuration = 60;

export const POST = handleRoute(
  "Import repository error",
  "Failed to import the repository",
  async (request: Request) => {
    const { userId, v0 } = await authorizeUserRoute(request);
    const { url, branch } = await parseJsonBody(request, importRepoBodySchema);

    const chatId = await importChat(userId, async () =>
      unwrapV0(
        await v0.chats.createFromRepo({
          repo: { url, ...(branch && { branch }) },
          privacy: "private",
          metadata: CHAT_METADATA,
        }),
      ),
    );
    return Response.json({ chatId }, { status: 201 });
  },
);
