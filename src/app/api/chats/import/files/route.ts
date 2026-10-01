import { CHAT_METADATA, importChat } from "@/server/chats/import-chat";
import { authorizeUserRoute } from "@/server/chats/route-auth";
import { importFilesBodySchema } from "@/server/chats/schemas";
import { parseJsonBody } from "@/server/http/request";
import { handleRoute } from "@/server/http/route";
import { unwrapV0 } from "@/server/v0/client";

export const maxDuration = 60;

export const POST = handleRoute(
  "Import files error",
  "Failed to import the files",
  async (request: Request) => {
    const { userId, v0 } = await authorizeUserRoute(request);
    const { files } = await parseJsonBody(request, importFilesBodySchema);

    const chatId = await importChat(userId, async () =>
      unwrapV0(
        await v0.chats.createFromFiles({
          files,
          privacy: "private",
          metadata: CHAT_METADATA,
        }),
      ),
    );
    return Response.json({ chatId }, { status: 201 });
  },
);
