import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getChatOwnership } from "@/lib/db/queries";
import { getUserV0Client, getV0ClientErrorResponse } from "@/lib/v0-client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const session = await auth();
    const { chatId } = await params;

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 },
      );
    }

    if (session?.user?.id) {
      const ownership = await getChatOwnership({ v0ChatId: chatId });

      if (!ownership) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }

      if (ownership.user_id !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const v0Client = await getUserV0Client(session).catch((error) => {
      const response = getV0ClientErrorResponse(error);
      if (response) {
        throw response;
      }
      throw error;
    });

    const chatDetails = await v0Client.chats.getById({ chatId });

    return NextResponse.json(chatDetails);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("Error fetching chat details:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch chat details",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
