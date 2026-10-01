import {
  Calculator01Icon,
  ChartLineData01Icon,
  Chatting01Icon,
  CheckListIcon,
  News01Icon,
  ShoppingCart01Icon,
  UserCircleIcon,
  WebDesign01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";

interface PromptSuggestion {
  label: string;
  icon: IconSvgElement;
  prompt: string;
}

const PROMPT_SUGGESTIONS: readonly PromptSuggestion[] = [
  {
    label: "Landing page",
    icon: WebDesign01Icon,
    prompt:
      "A modern SaaS landing page with a hero, feature grid, pricing table and FAQ",
  },
  {
    label: "Todo app",
    icon: CheckListIcon,
    prompt: "A todo app with projects, due dates, filters and a dark mode",
  },
  {
    label: "Dashboard",
    icon: ChartLineData01Icon,
    prompt:
      "An analytics dashboard with KPI cards, a revenue chart and a recent orders table",
  },
  {
    label: "Blog",
    icon: News01Icon,
    prompt: "A minimal blog with a post list, tags and a readable article page",
  },
  {
    label: "E-commerce",
    icon: ShoppingCart01Icon,
    prompt:
      "An e-commerce product page with an image gallery, variants and a cart drawer",
  },
  {
    label: "Portfolio",
    icon: UserCircleIcon,
    prompt:
      "A developer portfolio with an about section, project cards and a contact form",
  },
  {
    label: "Chat app",
    icon: Chatting01Icon,
    prompt: "A messaging app UI with a conversation list and a chat thread",
  },
  {
    label: "Calculator",
    icon: Calculator01Icon,
    prompt:
      "A polished calculator with keyboard support and calculation history",
  },
];

interface PromptSuggestionsProps {
  onSelect: (suggestion: string) => void;
}

export function PromptSuggestions({ onSelect }: PromptSuggestionsProps) {
  return (
    <Suggestions>
      {PROMPT_SUGGESTIONS.map(({ label, icon, prompt }) => (
        <Suggestion key={label} suggestion={prompt} onClick={onSelect}>
          <HugeiconsIcon icon={icon} strokeWidth={2} data-icon="inline-start" />
          {label}
        </Suggestion>
      ))}
    </Suggestions>
  );
}
