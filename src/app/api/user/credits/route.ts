import { authorizeUserRoute } from "@/server/chats/route-auth";
import { handleRoute } from "@/server/http/route";
import { getV0Credits } from "@/server/v0/credits";

export const GET = handleRoute(
  "Credits error",
  "Failed to load credits",
  async (request: Request) => {
    const { userId } = await authorizeUserRoute(request);
    return Response.json(await getV0Credits(userId));
  },
);
