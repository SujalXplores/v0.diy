import type { ReactNode } from "react";

interface PageContainerProps {
  header: ReactNode;
  children: ReactNode;
}

export function PageContainer({ header, children }: PageContainerProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {header}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
