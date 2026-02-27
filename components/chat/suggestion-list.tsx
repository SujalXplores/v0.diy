import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";

const DEFAULT_SUGGESTIONS = [
  "Landing page",
  "Todo app",
  "Dashboard",
  "Blog",
  "E-commerce",
  "Portfolio",
  "Chat app",
  "Calculator",
];

interface SuggestionListProps {
  onSelect: (suggestion: string) => void;
  suggestions?: string[];
}

export function SuggestionList({
  onSelect,
  suggestions = DEFAULT_SUGGESTIONS,
}: SuggestionListProps) {
  return (
    <Suggestions>
      {suggestions.map((suggestion) => (
        <Suggestion
          key={suggestion}
          onClick={() => onSelect(suggestion)}
          suggestion={suggestion}
        />
      ))}
    </Suggestions>
  );
}
