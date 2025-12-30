import { type NextRequest, NextResponse } from "next/server";
import { type ChatDetail, createClient } from "v0-sdk";
import { auth } from "@/app/(auth)/auth";
import {
  createAnonymousChatLog,
  createChatOwnership,
  getChatCountByIP,
  getChatCountByUserId,
} from "@/lib/db/queries";
import {
  anonymousEntitlements,
  entitlementsByUserType,
} from "@/lib/entitlements";
import { ChatSDKError } from "@/lib/errors";

const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
);

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
    const { message, chatId, streaming, attachments } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    if (session?.user?.id) {
      const chatCount = await getChatCountByUserId({
        userId: session.user.id,
        differenceInHours: 24,
      });

      const userType = session.user.type;
      if (chatCount >= entitlementsByUserType[userType].maxMessagesPerDay) {
        return new ChatSDKError("rate_limit:chat").toResponse();
      }
    } else {
      const clientIP = getClientIP(request);
      const chatCount = await getChatCountByIP({
        ipAddress: clientIP,
        differenceInHours: 24,
      });

      if (chatCount >= anonymousEntitlements.maxMessagesPerDay) {
        return new ChatSDKError("rate_limit:chat").toResponse();
      }
    }

    let chat: ChatDetail | ReadableStream<Uint8Array> | null = null;

    if (chatId) {
      if (streaming) {
        chat = await v0.chats.sendMessage({
          chatId: chatId,
          message,
          responseMode: "experimental_stream",
          ...(attachments && attachments.length > 0 && { attachments }),
        });

        return new Response(chat as ReadableStream<Uint8Array>, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }

      chat = await v0.chats.sendMessage({
        chatId: chatId,
        message,
        ...(attachments && attachments.length > 0 && { attachments }),
      });
    } else {
      if (streaming) {
        chat = await v0.chats.create({
          message,
          responseMode: "experimental_stream",
          ...(attachments && attachments.length > 0 && { attachments }),
        });

        return new Response(chat as ReadableStream<Uint8Array>, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }

      chat = await v0.chats.create({
        message,
        responseMode: "sync",
        ...(attachments && attachments.length > 0 && { attachments }),
      });
    }

    if (chat instanceof ReadableStream) {
      throw new Error("Unexpected streaming response");
    }

    const chatDetail = chat as ChatDetail;

    if (!chatId && chatDetail.id) {
      try {
        if (session?.user?.id) {
          await createChatOwnership({
            v0ChatId: chatDetail.id,
            userId: session.user.id,
          });
        } else {
          const clientIP = getClientIP(request);
          await createAnonymousChatLog({
            ipAddress: clientIP,
            v0ChatId: chatDetail.id,
          });
        }
      } catch (error) {
        console.error("Failed to create chat ownership/log:", error);
      }
    }

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
