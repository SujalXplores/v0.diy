import { authorizeChatRoute } from "@/server/chats/route-auth";
import { handleRoute } from "@/server/http/route";
import { toV0HttpError } from "@/server/v0/client";

type Context = RouteContext<"/api/chats/[chatId]/download">;

function toFileName(title: string | undefined, chatId: string): string {
  const slug = (title ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${slug || `v0-${chatId}`}.zip`;
}

export const GET = handleRoute(
  "Download files error",
  "Failed to download the code",
  async (request: Request, { params }: Context) => {
    const { chatId, v0 } = await authorizeChatRoute(request, params);

    const [download, chat] = await Promise.all([
      v0.chats.downloadFiles({ chatId }, { parseAs: "stream" }),
      v0.chats.get({ chatId }),
    ]);

    const response = download.response;
    if (download.error !== undefined || !response?.ok || !response.body) {
      throw toV0HttpError(response?.status, undefined);
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${toFileName(chat.data?.title, chatId)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  },
);
