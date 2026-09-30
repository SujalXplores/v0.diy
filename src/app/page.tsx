import { NewChatView } from "@/features/chat/components/new-chat-view";
import { EnvSetup } from "@/features/env-setup/components/env-setup";
import {
  getMissingEnvVars,
  toEnvFileContent,
} from "@/features/env-setup/lib/env-check";

export default function HomePage() {
  const missingEnvVars = getMissingEnvVars();

  // Only show the setup screen in development when variables are missing.
  if (process.env.NODE_ENV === "development" && missingEnvVars.length > 0) {
    return <EnvSetup envFileContent={toEnvFileContent(missingEnvVars)} />;
  }

  return <NewChatView />;
}
