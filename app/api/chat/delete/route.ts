import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "v0-sdk";

const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
);

export async function POST(request: NextRequest) {
  try {
    const { chatId } = await request.json();

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 },
      );
    }

    const result = await v0.chats.delete({
      chatId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 },
    );
  }
}
