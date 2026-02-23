import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getChatOwnership } from "@/lib/db/queries";
import { getUserV0Client, getV0ClientErrorResponse } from "@/lib/v0-client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const session = await auth();
    const { chatId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 },
      );
    }

    const ownership = await getChatOwnership({ v0ChatId: chatId });
    if (!ownership || ownership.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Chat not found or access denied" },
        { status: 404 },
      );
    }

    const { privacy } = await request.json();

    if (
      !(
        privacy &&
        ["public", "private", "team", "team-edit", "unlisted"].includes(privacy)
      )
    ) {
      return NextResponse.json(
        { error: "Invalid privacy setting" },
        { status: 400 },
      );
    }

    const v0Client = await getUserV0Client(session).catch((error) => {
      const response = getV0ClientErrorResponse(error);
      if (response) {
        throw response;
      }
      throw error;
    });

    const updatedChat = await v0Client.chats.update({
      chatId,
      privacy,
    });

    return NextResponse.json(updatedChat);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("Change Chat Visibility Error:", error);

    return NextResponse.json(
      {
        error: "Failed to change chat visibility",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
