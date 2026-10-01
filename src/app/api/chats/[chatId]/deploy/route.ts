import { authorizeChatRoute } from "@/server/chats/route-auth";
import { handleRoute } from "@/server/http/route";
import { unwrapV0 } from "@/server/v0/client";

type Context = RouteContext<"/api/chats/[chatId]/deploy">;

export const POST = handleRoute(
  "Deploy chat error",
  "Failed to start the deployment",
  async (request: Request, { params }: Context) => {
    const { chatId, v0 } = await authorizeChatRoute(request, params);
    return Response.json(unwrapV0(await v0.chats.deploy({ chatId })));
  },
);
