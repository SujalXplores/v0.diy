import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "v0-sdk";
import { auth } from "@/app/(auth)/auth";
import { getChatIdsByUserId } from "@/lib/db/queries";

const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
);

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

    const allChats = await v0.chats.find();

    const userChats =
      allChats.data?.filter((chat) => userChatIds.includes(chat.id)) || [];

    return NextResponse.json({ data: userChats });
  } catch (error) {
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
