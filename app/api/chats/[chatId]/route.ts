import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "v0-sdk";
import { auth } from "@/app/(auth)/auth";
import { getChatOwnership } from "@/lib/db/queries";

const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
);

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

    const chatDetails = await v0.chats.getById({ chatId });

    return NextResponse.json(chatDetails);
  } catch (error) {
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
