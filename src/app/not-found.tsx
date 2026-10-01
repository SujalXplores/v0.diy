import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <PageContainer header={<AppHeader />}>
      <Empty className="min-h-[60vh]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>We couldn&apos;t find that page</EmptyTitle>
          <EmptyDescription>
            It may have been deleted, or the link might belong to someone
            else&apos;s chat.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button asChild variant="outline">
            <Link href="/chats">Your chats</Link>
          </Button>
          <Button asChild>
            <Link href="/">Start a new chat</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </PageContainer>
  );
}
