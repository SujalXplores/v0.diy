"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface StreamingHandoff {
  chatId: string | null;
  stream: ReadableStream<Uint8Array> | null;
  userMessage: string | null;
}

interface StreamingContextType {
  readonly handoff: StreamingHandoff;
  readonly startHandoff: (
    chatId: string,
    stream: ReadableStream<Uint8Array>,
    userMessage: string,
  ) => void;
  readonly clearHandoff: () => void;
}

const StreamingContext = createContext<StreamingContextType | null>(null);

export const useStreaming = (): StreamingContextType => {
  const context = useContext(StreamingContext);
  if (!context) {
    throw new Error("useStreaming must be used within a <StreamingProvider />");
  }
  return context;
};

interface StreamingProviderProps {
  readonly children: ReactNode;
}

export const StreamingProvider = ({ children }: StreamingProviderProps) => {
  const [handoff, setHandoff] = useState<StreamingHandoff>({
    chatId: null,
    stream: null,
    userMessage: null,
  });

  const startHandoff = useCallback(
    (
      chatId: string,
      stream: ReadableStream<Uint8Array>,
      userMessage: string,
    ) => {
      setHandoff({ chatId, stream, userMessage });
    },
    [],
  );

  const clearHandoff = useCallback(() => {
    setHandoff({ chatId: null, stream: null, userMessage: null });
  }, []);

  const value = useMemo(
    () => ({
      handoff,
      startHandoff,
      clearHandoff,
    }),
    [handoff, startHandoff, clearHandoff],
  );

  return (
    <StreamingContext.Provider value={value}>
      {children}
    </StreamingContext.Provider>
  );
};
