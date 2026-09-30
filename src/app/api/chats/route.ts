import { auth } from "@/server/auth/auth";
import { listUserChats } from "@/server/chats/list-user-chats";
import { toErrorResponse } from "@/server/http/errors";

/** Lists the signed-in user's chats; anonymous users get an empty list. */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return Response.json({ data: [] });
    }

    return Response.json({ data: await listUserChats(userId) });
  } catch (error) {
    return toErrorResponse(error, "Chats fetch error", "Failed to fetch chats");
  }
}
