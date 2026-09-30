"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLatestRef } from "./use-latest-ref";

function getRecognitionConstructor(): SpeechRecognitionConstructor | undefined {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

// Browser support never changes at runtime, so there is nothing to subscribe to.
const subscribeToNothing = () => () => undefined;

interface UseSpeechRecognitionOptions {
  lang?: string;
  onTranscript: (transcript: string) => void;
  onError?: (error: string) => void;
}

/** Single-utterance speech-to-text using the Web Speech API. */
export function useSpeechRecognition({
  lang = "en-US",
  onTranscript,
  onError,
}: UseSpeechRecognitionOptions) {
  const isSupported = useSyncExternalStore(
    subscribeToNothing,
    () => getRecognitionConstructor() !== undefined,
    () => false,
  );
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // Recognition events fire long after render; read the latest callbacks.
  const callbacksRef = useLatestRef({ onTranscript, onError });

  useEffect(
    () => () => {
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onend = null;
        recognition.onerror = null;
        recognition.onresult = null;
        recognition.abort();
      }
    },
    [],
  );

  const getRecognition = (): SpeechRecognition | null => {
    if (recognitionRef.current) {
      return recognitionRef.current;
    }

    const Recognition = getRecognitionConstructor();
    if (!Recognition) {
      return null;
    }

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        callbacksRef.current.onTranscript(transcript);
      }
      setIsListening(false);
    };
    recognition.onerror = (event) => {
      // "aborted" comes from stopping or unmounting, not a real failure.
      if (event.error !== "aborted") {
        console.error("Speech recognition error:", event.error);
        callbacksRef.current.onError?.(event.error);
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return recognition;
  };

  const toggle = () => {
    const recognition = getRecognition();
    if (!recognition) {
      return;
    }

    try {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    } catch (error) {
      console.error("Error toggling speech recognition:", error);
      setIsListening(false);
      if (!isListening) {
        callbacksRef.current.onError?.("Failed to start speech recognition");
      }
    }
  };

  return { isSupported, isListening, toggle };
}
