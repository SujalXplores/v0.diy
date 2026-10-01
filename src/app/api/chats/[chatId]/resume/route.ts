import { authorizeChatRoute } from "@/server/chats/route-auth";
import { HttpError } from "@/server/http/errors";
import { handleRoute } from "@/server/http/route";
import { openV0Stream } from "@/server/v0/stream";

type Context = RouteContext<"/api/chats/[chatId]/resume">;

export const maxDuration = 300;

export const POST = handleRoute(
  "Resume chat error",
  "Failed to resume the generation",
  async (request: Request, { params }: Context) => {
    const { chatId, v0 } = await authorizeChatRoute(request, params);

    try {
      const opened = await openV0Stream(
        (options) => v0.chats.resume({ chatId }, options),
        { signal: request.signal },
      );
      return opened.result.toResponse();
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        return new Response(null, { status: 204 });
      }
      throw error;
    }
  },
);
