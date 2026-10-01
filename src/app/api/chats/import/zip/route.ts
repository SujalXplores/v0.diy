import { CHAT_METADATA, importChat } from "@/server/chats/import-chat";
import { authorizeUserRoute } from "@/server/chats/route-auth";
import { importZipBodySchema } from "@/server/chats/schemas";
import { parseJsonBody } from "@/server/http/request";
import { handleRoute } from "@/server/http/route";
import { unwrapV0 } from "@/server/v0/client";

export const maxDuration = 120;

export const POST = handleRoute(
  "Import ZIP error",
  "Failed to import the ZIP",
  async (request: Request) => {
    const { userId, v0 } = await authorizeUserRoute(request);
    const { url, title } = await parseJsonBody(request, importZipBodySchema);

    const chatId = await importChat(userId, async () =>
      unwrapV0(
        await v0.chats.createFromZip({
          url,
          privacy: "private",
          metadata: CHAT_METADATA,
          ...(title && { title }),
        }),
      ),
    );
    return Response.json({ chatId }, { status: 201 });
  },
);
