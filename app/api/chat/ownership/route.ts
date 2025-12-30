import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { createAnonymousChatLog, createChatOwnership } from "@/lib/db/queries";

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

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

    if (session?.user?.id) {
      await createChatOwnership({
        v0ChatId: chatId,
        userId: session.user.id,
      });
    } else {
      const clientIP = getClientIP(request);
      await createAnonymousChatLog({
        ipAddress: clientIP,
        v0ChatId: chatId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create chat ownership/log:", error);
    return NextResponse.json(
      { error: "Failed to create ownership record" },
      { status: 500 },
    );
  }
}
