import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getUserV0Client, getV0ClientErrorResponse } from "@/lib/v0-client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { chatId } = await request.json();

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
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

    const result = await v0Client.chats.delete({
      chatId,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 },
    );
  }
}
