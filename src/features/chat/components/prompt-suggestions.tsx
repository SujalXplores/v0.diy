import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";

const PROMPT_SUGGESTIONS = [
  "Landing page",
  "Todo app",
  "Dashboard",
  "Blog",
  "E-commerce",
  "Portfolio",
  "Chat app",
  "Calculator",
] as const;

interface PromptSuggestionsProps {
  onSelect: (suggestion: string) => void;
}

/** One-click starter prompts shown under the homepage input. */
export function PromptSuggestions({ onSelect }: PromptSuggestionsProps) {
  return (
    <Suggestions>
      {PROMPT_SUGGESTIONS.map((suggestion) => (
        <Suggestion
          key={suggestion}
          suggestion={suggestion}
          onClick={onSelect}
        />
      ))}
    </Suggestions>
  );
}
