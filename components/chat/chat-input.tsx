import { useCallback, useEffect, useState } from "react";
import {
  clearPromptFromStorage,
  createImageAttachment,
  createImageAttachmentFromStored,
  type ImageAttachment,
  loadPromptFromStorage,
  PromptInput,
  PromptInputImageButton,
  PromptInputImagePreview,
  PromptInputMicButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  savePromptToStorage,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { PROMPT_SUGGESTIONS } from "@/lib/prompt-suggestions";

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    attachments?: Array<{ url: string }>,
  ) => void;
  isLoading: boolean;
  showSuggestions: boolean;
  attachments?: ImageAttachment[];
  onAttachmentsChange?: (attachments: ImageAttachment[]) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function ChatInput({
  message,
  setMessage,
  onSubmit,
  isLoading,
  showSuggestions,
  attachments = [],
  onAttachmentsChange,
  textareaRef,
}: ChatInputProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleImageFiles = useCallback(
    async (files: File[]) => {
      if (!onAttachmentsChange) {
        return;
      }

      try {
        const newAttachments = await Promise.all(
          files.map((file) => createImageAttachment(file)),
        );
        onAttachmentsChange([...attachments, ...newAttachments]);
      } catch (error) {
        console.error("Error processing image files:", error);
      }
    },
    [attachments, onAttachmentsChange],
  );

  const handleRemoveAttachment = useCallback(
    (id: string) => {
      if (!onAttachmentsChange) {
        return;
      }
      onAttachmentsChange(attachments.filter((att) => att.id !== id));
    },
    [attachments, onAttachmentsChange],
  );

  const handleDragOver = useCallback(() => {
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(() => {
    setIsDragOver(false);
  }, []);

  useEffect(() => {
    if (message.trim() || attachments.length > 0) {
      savePromptToStorage(message, attachments);
    } else {
      clearPromptFromStorage();
    }
  }, [message, attachments]);

  useEffect(() => {
    if (!message && attachments.length === 0) {
      const storedData = loadPromptFromStorage();
      if (storedData) {
        setMessage(storedData.message);
        if (storedData.attachments.length > 0 && onAttachmentsChange) {
          const restoredAttachments = storedData.attachments.map(
            createImageAttachmentFromStored,
          );
          onAttachmentsChange(restoredAttachments);
        }
      }
    }
  }, [message, attachments, setMessage, onAttachmentsChange]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      clearPromptFromStorage();

      const attachmentUrls = attachments.map((att) => ({ url: att.dataUrl }));
      onSubmit(e, attachmentUrls.length > 0 ? attachmentUrls : undefined);
    },
    [onSubmit, attachments],
  );

  const submitSuggestion = useCallback(
    (suggestion: string) => {
      setMessage(suggestion);
      setTimeout(() => {
        textareaRef?.current?.form?.requestSubmit();
      }, 0);
    },
    [setMessage, textareaRef],
  );

  return (
    <div className="p-4 pt-0">
      <div className="flex gap-2">
        <PromptInput
          onSubmit={handleSubmit}
          className="relative mx-auto w-full max-w-2xl"
          onImageDrop={handleImageFiles}
          isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <PromptInputImagePreview
            attachments={attachments}
            onRemove={handleRemoveAttachment}
          />
          <PromptInputTextarea
            ref={textareaRef}
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            className="min-h-[60px]"
            placeholder="Continue the conversation..."
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputImageButton onImageSelect={handleImageFiles} />
            </PromptInputTools>
            <PromptInputTools>
              <PromptInputMicButton
                onTranscript={(transcript) => {
                  setMessage(message + (message ? " " : "") + transcript);
                }}
                onError={(error) => {
                  console.error("Speech recognition error:", error);
                }}
              />
              <PromptInputSubmit
                disabled={!message}
                status={isLoading ? "streaming" : "ready"}
              />
            </PromptInputTools>
          </PromptInputToolbar>
        </PromptInput>
      </div>
      {showSuggestions && (
        <div className="mx-auto mt-2 max-w-2xl">
          <Suggestions>
            {PROMPT_SUGGESTIONS.map((suggestion) => (
              <Suggestion
                key={suggestion}
                onClick={() => submitSuggestion(suggestion)}
                suggestion={suggestion}
              />
            ))}
          </Suggestions>
        </div>
      )}
    </div>
  );
}
