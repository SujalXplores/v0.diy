"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  createImageAttachments,
  type ImageAttachment,
} from "../lib/image-attachments";
import {
  clearPromptDraft,
  loadPromptDraft,
  savePromptDraft,
} from "../lib/prompt-draft-storage";

const SAVE_DELAY_MS = 300;

export function usePromptComposer(scope: string) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<ImageAttachment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    const draft = loadPromptDraft(scope);
    if (draft) {
      // react-doctor-disable-next-line react-hooks-js/set-state-in-effect
      setMessage(draft.message);
      setAttachments(draft.attachments);
    }
    hasRestoredRef.current = true;
  }, [scope]);

  useEffect(() => {
    if (!hasRestoredRef.current) {
      return;
    }
    const timeout = setTimeout(() => {
      if (message.trim() || attachments.length > 0) {
        savePromptDraft(scope, { message, attachments });
      } else {
        clearPromptDraft(scope);
      }
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [scope, message, attachments]);

  const addImages = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }
    setIsProcessing(true);
    const { added, rejected } = await createImageAttachments(
      files,
      attachments,
    );
    setIsProcessing(false);

    if (added.length > 0) {
      setAttachments((current) => [...current, ...added]);
    }
    if (rejected.length > 0) {
      toast.error([...new Set(rejected)].join(". "));
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((current) => current.filter((item) => item.id !== id));
  };

  const appendTranscript = (transcript: string) => {
    setMessage((current) =>
      current ? `${current} ${transcript}` : transcript,
    );
  };

  const clear = () => {
    setMessage("");
    setAttachments([]);
    clearPromptDraft(scope);
  };

  const restore = (text: string, images: ImageAttachment[]) => {
    setMessage(text);
    setAttachments(images);
  };

  return {
    message,
    setMessage,
    attachments,
    isProcessing,
    addImages,
    removeAttachment,
    appendTranscript,
    clear,
    restore,
  };
}

export type PromptComposerState = ReturnType<typeof usePromptComposer>;
