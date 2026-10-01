import {
  ArrowLeft01Icon,
  BrowserIcon,
  Key01Icon,
  SourceCodeIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo, LogoMark } from "@/components/layout/logo";

interface AuthCardProps {
  title: string;
  description: string;
  notice?: ReactNode;
  children: ReactNode;
}

const FEATURES: { icon: IconSvgElement; title: string; body: string }[] = [
  {
    icon: BrowserIcon,
    title: "Live previews",
    body: "Watch each generation render next to the conversation.",
  },
  {
    icon: Key01Icon,
    title: "Bring your own key",
    body: "Use your own v0 API key. It's encrypted before it's stored.",
  },
  {
    icon: SourceCodeIcon,
    title: "Open source",
    body: "Built on the v0 SDK. Fork it, self-host it, make it yours.",
  },
];

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden border-r bg-muted/30 lg:flex lg:flex-col lg:justify-between lg:p-10">
      <div className="mask-radial-fade pointer-events-none absolute inset-0 bg-dot-grid" />

      <Link href="/" className="relative w-fit" aria-label="v0.diy home">
        <Logo />
      </Link>

      <div className="relative max-w-md space-y-8">
        <h2 className="text-balance font-semibold text-3xl tracking-tight">
          Turn a sentence into a working app.
        </h2>
        <ul className="space-y-5">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background ring-1 ring-foreground/10">
                <HugeiconsIcon
                  icon={feature.icon}
                  strokeWidth={2}
                  className="size-4"
                />
              </span>
              <div className="space-y-0.5">
                <p className="font-medium text-sm">{feature.title}</p>
                <p className="text-muted-foreground text-xs/relaxed">
                  {feature.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-muted-foreground text-xs">
        Powered by the v0 Platform API
      </p>
    </aside>
  );
}

export function AuthCard({
  title,
  description,
  notice,
  children,
}: AuthCardProps) {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-2">
      <BrandPanel />

      <main className="relative flex flex-col p-4 sm:p-6">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            strokeWidth={2}
            className="size-3.5"
          />
          Back to home
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center">
              <LogoMark className="mx-auto size-9 text-xs lg:hidden" />
              <h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
            {notice}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
