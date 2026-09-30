import type { ReactNode } from "react";

interface PageContainerProps {
  header: ReactNode;
  children: ReactNode;
}

/** Full-height page with the app header and a centered content column. */
export function PageContainer({ header, children }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {header}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
