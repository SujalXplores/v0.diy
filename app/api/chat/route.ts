import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import type { ChatDetail } from "v0-sdk";
import { auth } from "@/app/(auth)/auth";
import { createChatOwnership, getChatCountByUserId } from "@/lib/db/queries";
import { userEntitlements } from "@/lib/entitlements";
import { ChatSDKError } from "@/lib/errors";
import { getUserV0Client, getV0ClientErrorResponse } from "@/lib/v0-client";

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

async function resolveV0Client(session: Session | null) {
  return getUserV0Client(session).catch((error) => {
    const response = getV0ClientErrorResponse(error);
    if (response) {
      throw response;
    }
    throw error;
  });
}

async function executeChatRequest({
  v0Client,
  message,
  chatId,
  streaming,
  attachments,
}: {
  v0Client: Awaited<ReturnType<typeof getUserV0Client>>;
  message: string;
  chatId?: string;
  streaming?: boolean;
  attachments?: Array<{ url: string }>;
}) {
  const attachmentOptions =
    attachments && attachments.length > 0 ? { attachments } : {};

  if (chatId) {
    return v0Client.chats.sendMessage({
      chatId,
      message,
      ...(streaming && { responseMode: "experimental_stream" }),
      ...attachmentOptions,
    });
  }

  return v0Client.chats.create({
    message,
    responseMode: streaming ? "experimental_stream" : "sync",
    ...attachmentOptions,
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

    const v0Client = await resolveV0Client(session);

    const chat = await executeChatRequest({
      v0Client,
      message,
      chatId,
      streaming,
      attachments,
    });

    if (chat instanceof ReadableStream) {
      return createStreamingResponse(chat);
    }

    const chatDetail = chat as ChatDetail;

    if (!chatId && chatDetail.id) {
      await recordChatOwnership(chatDetail.id, session);
    }

    return formatChatResponse(chatDetail);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

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
