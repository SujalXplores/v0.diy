import { authorizeChatRoute } from "@/server/chats/route-auth";
import { updateFilesBodySchema } from "@/server/chats/schemas";
import { parseJsonBody } from "@/server/http/request";
import { handleRoute } from "@/server/http/route";
import { unwrapV0 } from "@/server/v0/client";

type Context = RouteContext<"/api/chats/[chatId]/files">;

export const GET = handleRoute(
  "Get files error",
  "Failed to load the code",
  async (request: Request, { params }: Context) => {
    const { chatId, v0 } = await authorizeChatRoute(request, params);
    return Response.json(unwrapV0(await v0.chats.getFiles({ chatId })));
  },
);

export const PATCH = handleRoute(
  "Update files error",
  "Failed to save your changes",
  async (request: Request, { params }: Context) => {
    const { chatId, v0 } = await authorizeChatRoute(request, params);
    const { files } = await parseJsonBody(request, updateFilesBodySchema);

    return Response.json(
      unwrapV0(await v0.chats.updateFiles({ chatId, files })),
    );
  },
);
