"use client";

import { useEffect, useState } from "react";
import { createImageAttachment } from "../lib/image-attachments";
import {
  clearPromptDraft,
  loadPromptDraft,
  savePromptDraft,
} from "../lib/prompt-draft-storage";
import type { ImageAttachment } from "../types";

/**
 * Draft message and image attachments of a prompt input, persisted to
 * sessionStorage so an unsent prompt survives reloads and sign-in redirects.
 */
export function usePromptComposer() {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<ImageAttachment[]>([]);

  // Restore the draft after hydration; sessionStorage doesn't exist on the
  // server. Must run before the persist effect below reads the empty state.
  useEffect(() => {
    const draft = loadPromptDraft();
    if (draft) {
      // Reading storage during render would mismatch the server HTML.
      // react-doctor-disable-next-line react-hooks-js/set-state-in-effect
      setMessage(draft.message);
      setAttachments(draft.attachments);
    }
  }, []);

  useEffect(() => {
    if (message.trim() || attachments.length > 0) {
      savePromptDraft({ message, attachments });
    } else {
      clearPromptDraft();
    }
  }, [message, attachments]);

  const addImages = async (files: File[]) => {
    try {
      const added = await Promise.all(files.map(createImageAttachment));
      setAttachments((current) => [...current, ...added]);
    } catch (error) {
      console.error("Error processing image files:", error);
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

  /** Empties the input, e.g. right after a message is sent. */
  const clear = () => {
    setMessage("");
    setAttachments([]);
    clearPromptDraft();
  };

  /** Puts a message back, e.g. when sending was blocked. */
  const restore = (text: string, images: ImageAttachment[]) => {
    setMessage(text);
    setAttachments(images);
  };

  return {
    message,
    setMessage,
    attachments,
    addImages,
    removeAttachment,
    appendTranscript,
    clear,
    restore,
  };
}

export type PromptComposer = ReturnType<typeof usePromptComposer>;
