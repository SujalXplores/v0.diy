import { z } from "zod";
import { authorizeChatRoute } from "@/server/chats/route-auth";
import { parseParam } from "@/server/http/request";
import { handleRoute } from "@/server/http/route";
import { unwrapV0 } from "@/server/v0/client";

type Context = RouteContext<"/api/chats/[chatId]/connect-status">;

const requestIdSchema = z.string().min(1).max(200);

export const GET = handleRoute(
  "Connect status error",
  "Failed to check the connection",
  async (request: Request, { params }: Context) => {
    const { chatId, v0 } = await authorizeChatRoute(request, params);
    const requestId = parseParam(
      new URL(request.url).searchParams.get("requestId"),
      requestIdSchema,
    );

    return Response.json(
      unwrapV0(await v0.chats.getConnectStatus({ chatId, requestId })),
    );
  },
);
