import { authorizeUserRoute } from "@/server/chats/route-auth";
import { handleRoute } from "@/server/http/route";
import { unwrapV0 } from "@/server/v0/client";

export const GET = handleRoute(
  "Usage summary error",
  "Failed to load usage",
  async (request: Request) => {
    const { v0 } = await authorizeUserRoute(request);
    return Response.json(unwrapV0(await v0.usage.getSummary({})));
  },
);
