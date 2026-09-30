import { Eye, EyeOff, Lock, type LucideIcon, Users } from "lucide-react";
import type { ChatPrivacy } from "../types";

export interface PrivacyOption {
  value: ChatPrivacy;
  label: string;
  description: string;
  icon: LucideIcon;
}

const PRIVATE_OPTION: PrivacyOption = {
  value: "private",
  label: "Private",
  description: "Only you can see this chat",
  icon: EyeOff,
};

/** Visibility settings in the order they're offered to the user. */
export const PRIVACY_OPTIONS: readonly PrivacyOption[] = [
  PRIVATE_OPTION,
  {
    value: "public",
    label: "Public",
    description: "Anyone can see this chat",
    icon: Eye,
  },
  {
    value: "team",
    label: "Team",
    description: "Team members can see this chat",
    icon: Users,
  },
  {
    value: "team-edit",
    label: "Team Edit",
    description: "Team members can see and edit this chat",
    icon: Users,
  },
  {
    value: "unlisted",
    label: "Unlisted",
    description: "Only people with the link can see this chat",
    icon: Lock,
  },
];

export function getPrivacyOption(privacy: ChatPrivacy): PrivacyOption {
  return (
    PRIVACY_OPTIONS.find((option) => option.value === privacy) ?? PRIVATE_OPTION
  );
}

export function isChatPrivacy(value: string): value is ChatPrivacy {
  return PRIVACY_OPTIONS.some((option) => option.value === value);
}
