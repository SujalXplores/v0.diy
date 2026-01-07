import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { createChatOwnership } from "@/lib/db/queries";

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

    // Require authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    await createChatOwnership({
      v0ChatId: chatId,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create chat ownership:", error);
    return NextResponse.json(
      { error: "Failed to create ownership record" },
      { status: 500 },
    );
  }
}
