import {
  LinkSquare02Icon,
  SquareLock02Icon,
  UserGroupIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import type { ChatPrivacy } from "../types";

export interface PrivacyOption {
  value: ChatPrivacy;
  label: string;
  description: string;
  icon: IconSvgElement;
}

const PRIVATE_OPTION: PrivacyOption = {
  value: "private",
  label: "Private",
  description: "Only you can see this chat",
  icon: SquareLock02Icon,
};

export const PRIVACY_OPTIONS: readonly PrivacyOption[] = [
  PRIVATE_OPTION,
  {
    value: "public",
    label: "Public",
    description: "Anyone can see this chat",
    icon: ViewIcon,
  },
  {
    value: "team",
    label: "Team",
    description: "Team members can see this chat",
    icon: UserGroupIcon,
  },
  {
    value: "team-edit",
    label: "Team Edit",
    description: "Team members can see and edit this chat",
    icon: UserGroupIcon,
  },
  {
    value: "unlisted",
    label: "Unlisted",
    description: "Only people with the link can see this chat",
    icon: LinkSquare02Icon,
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
