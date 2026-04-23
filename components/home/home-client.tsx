"use client";

import { Suspense } from "react";
import { AppHeader } from "@/components/shared/app-header";
import { useHomeChatController } from "@/hooks/use-home-chat-controller";
import { HomeChatView } from "./home-chat-view";
import { HomeLandingView } from "./home-landing-view";
import { SearchParamsHandler } from "./search-params-handler";

export function HomeClient() {
  const {
    message,
    setMessage,
    isLoading,
    setIsLoading,
    showChatInterface,
    attachments,
    isDragOver,
    chatHistory,
    currentChat,
    isFullscreen,
    setIsFullscreen,
    refreshKey,
    setRefreshKey,
    textareaRef,
    handleReset,
    handleImageFiles,
    handleRemoveAttachment,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSendMessage,
    handleChatSendMessage,
    handleChatData,
    handleStreamingComplete,
  } = useHomeChatController();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-black">
      <Suspense fallback={null}>
        <SearchParamsHandler onReset={handleReset} />
      </Suspense>

      <AppHeader />

      {showChatInterface ? (
        <HomeChatView
          chatHistory={chatHistory}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          message={message}
          setMessage={setMessage}
          handleChatSendMessage={handleChatSendMessage}
          handleStreamingComplete={handleStreamingComplete}
          handleChatData={handleChatData}
          currentChat={currentChat}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
          refreshKey={refreshKey}
          setRefreshKey={setRefreshKey}
        />
      ) : (
        <HomeLandingView
          message={message}
          setMessage={setMessage}
          isLoading={isLoading}
          attachments={attachments}
          isDragOver={isDragOver}
          textareaRef={textareaRef}
          onSubmit={handleSendMessage}
          onImageFiles={handleImageFiles}
          onRemoveAttachment={handleRemoveAttachment}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      )}
    </div>
  );
}
