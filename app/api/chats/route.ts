import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getChatIdsByUserId } from "@/lib/db/queries";
import { getUserV0Client, getV0ClientErrorResponse } from "@/lib/v0-client";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ data: [] });
    }

    const userChatIds = await getChatIdsByUserId({ userId: session.user.id });

    if (userChatIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const v0Client = await getUserV0Client(session).catch((error) => {
      const response = getV0ClientErrorResponse(error);
      if (response) {
        throw response;
      }
      throw error;
    });

    const allChats = await v0Client.chats.find();

    const userChats =
      allChats.data?.filter((chat) => userChatIds.includes(chat.id)) || [];

    return NextResponse.json({ data: userChats });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("Chats fetch error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch chats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
