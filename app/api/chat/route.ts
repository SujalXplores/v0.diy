import { type NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { type ChatDetail, createClient } from "v0-sdk";
import { auth } from "@/app/(auth)/auth";
import { createChatOwnership, getChatCountByUserId } from "@/lib/db/queries";
import { userEntitlements } from "@/lib/entitlements";
import { ChatSDKError } from "@/lib/errors";

const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
);

const STREAMING_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
} as const;

async function checkRateLimit(
  session: Session | null,
): Promise<Response | null> {
  // Require authentication
  if (!session?.user?.id) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const chatCount = await getChatCountByUserId({
    userId: session.user.id,
    differenceInHours: 24,
  });

  if (chatCount >= userEntitlements.maxMessagesPerDay) {
    return new ChatSDKError("rate_limit:chat").toResponse();
  }

  return null;
}

function createStreamingResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, { headers: STREAMING_HEADERS });
}

async function recordChatOwnership(
  chatId: string,
  session: Session | null,
): Promise<void> {
  try {
    if (session?.user?.id) {
      await createChatOwnership({ v0ChatId: chatId, userId: session.user.id });
    }
  } catch (error) {
    console.error("Failed to create chat ownership:", error);
  }
}

function formatChatResponse(chatDetail: ChatDetail) {
  return NextResponse.json({
    id: chatDetail.id,
    demo: chatDetail.demo,
    messages: chatDetail.messages?.map((msg) => ({
      ...msg,
      experimental_content: (
        msg as typeof msg & { experimental_content?: unknown }
      ).experimental_content,
    })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { message, chatId, streaming, attachments } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const rateLimitResponse = await checkRateLimit(session);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const attachmentOptions =
      attachments && attachments.length > 0 ? { attachments } : {};

    let chat: ChatDetail | ReadableStream<Uint8Array> | null = null;

    if (chatId) {
      chat = await v0.chats.sendMessage({
        chatId,
        message,
        ...(streaming && { responseMode: "experimental_stream" }),
        ...attachmentOptions,
      });
    } else {
      chat = await v0.chats.create({
        message,
        responseMode: streaming ? "experimental_stream" : "sync",
        ...attachmentOptions,
      });
    }

    if (chat instanceof ReadableStream) {
      return createStreamingResponse(chat);
    }

    const chatDetail = chat as ChatDetail;

    if (!chatId && chatDetail.id) {
      await recordChatOwnership(chatDetail.id, session);
    }

    return formatChatResponse(chatDetail);
  } catch (error) {
    console.error("V0 API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
