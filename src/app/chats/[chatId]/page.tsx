import { ChatDetailView } from "@/features/chat/components/chat-detail-view";

export default async function ChatDetailPage({
  params,
}: PageProps<"/chats/[chatId]">) {
  const { chatId } = await params;

  // Keyed so switching chats starts from a fresh conversation state.
  return <ChatDetailView key={chatId} chatId={chatId} />;
}
