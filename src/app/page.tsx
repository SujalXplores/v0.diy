import { NewChatView } from "@/features/chat/components/new-chat-view";
import { EnvSetup } from "@/features/env-setup/components/env-setup";
import {
  getMissingEnvVars,
  toEnvFileContent,
} from "@/features/env-setup/lib/env-check";

export default function HomePage() {
  const missingEnvVars = getMissingEnvVars();

  if (process.env.NODE_ENV === "development" && missingEnvVars.length > 0) {
    return (
      <EnvSetup
        envVars={missingEnvVars}
        envFileContent={toEnvFileContent(missingEnvVars)}
      />
    );
  }

  return <NewChatView />;
}
