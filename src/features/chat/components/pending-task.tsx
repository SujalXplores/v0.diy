"use client";

import {
  ArrowUpRight01Icon,
  CheckListIcon,
  HelpCircleIcon,
  Plug01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  getPendingV0Task,
  type V0PendingTask,
  type V0UIMessage,
} from "@v0-sdk/react";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { Response } from "@/components/ai-elements/response";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useLatestRef } from "@/hooks/use-latest-ref";
import type { ResolveTask } from "../hooks/use-chat-session";
import { createVercelProject, fetchConnectStatus } from "../lib/chat-api";
import { describeChatError } from "../lib/chat-errors";
import type { ChatMessagePart } from "../lib/v0-messages";

type QuestionsData = Extract<V0PendingTask, { type: "questions" }>["data"];
type Question = QuestionsData["questions"][number];
type PlanData = Extract<V0PendingTask, { type: "plan" }>["data"];
type IntegrationData = Extract<V0PendingTask, { type: "integration" }>["data"];
type Permission = Extract<
  V0PendingTask,
  { type: "permissions" }
>["permissions"][number];
type ConfirmedSteps = Extract<ResolveTask, { type: "confirmed-steps" }>;
type McpPreset = NonNullable<ConfirmedSteps["connectedMcpPresetNames"]>[number];
type AgentActionPart = Extract<
  ChatMessagePart,
  { type: "data-v0-agent-action" }
>;

const MCP_PRESETS = [
  "Linear",
  "Notion",
  "Context7",
  "Sentry",
  "Zapier",
  "Glean",
  "Hex",
  "Sanity",
  "Granola",
  "PostHog",
  "Contentful",
  "Slack",
] as const satisfies readonly McpPreset[];

const isMcpPreset = (value: string): value is McpPreset =>
  (MCP_PRESETS as readonly string[]).includes(value);

interface ConnectRequest {
  status: "setup-required" | "authorization-required";
  requestId: string;
  service: string;
  connectorName: string;
  url: string;
}

function getConnectRequest(message: V0UIMessage): ConnectRequest | null {
  const part = message.parts.findLast(
    (candidate): candidate is AgentActionPart =>
      candidate.type === "data-v0-agent-action" &&
      candidate.data.name === "configure_vercel_connect",
  );
  const data = part?.data.data;
  if (!(data && "status" in data)) {
    return null;
  }
  if (data.status === "setup-required") {
    return { ...data, url: data.setupUrl };
  }
  if (data.status === "authorization-required") {
    return { ...data, url: data.authorizationUrl };
  }
  return null;
}

interface PendingTaskProps {
  chatId: string;
  message: V0UIMessage;
  vercelProjectId: string | undefined;
  disabled: boolean;
  onResolve: (task: ResolveTask) => void;
  onRejectPermission: () => void;
}

export function PendingTask(props: PendingTaskProps) {
  const task = getPendingV0Task(props.message);
  if (task) {
    switch (task.type) {
      case "questions":
        return <QuestionsTask {...props} data={task.data} />;
      case "plan":
        return <PlanTask {...props} data={task.data} />;
      case "integration":
        return <IntegrationTask {...props} data={task.data} />;
      case "permissions":
        return <PermissionsTask {...props} permissions={task.permissions} />;
    }
  }

  const connect = getConnectRequest(props.message);
  return connect ? <ConnectTask {...props} request={connect} /> : null;
}

function TaskCard({
  icon,
  title,
  description,
  children,
}: {
  icon: IconSvgElement;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-3 rounded-lg bg-card p-3 text-xs ring-1 ring-foreground/10">
      <header className="flex items-start gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted">
          <HugeiconsIcon icon={icon} strokeWidth={2} className="size-3.5" />
        </span>
        <div className="min-w-0 space-y-0.5">
          <h3 className="font-medium text-sm">{title}</h3>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}

function QuestionField({
  question,
  disabled,
  selected,
  customText,
  onSelect,
  onCustomText,
}: {
  question: Question;
  disabled: boolean;
  selected: string[];
  customText: string;
  onSelect: (labels: string[]) => void;
  onCustomText: (text: string) => void;
}) {
  return (
    <FieldSet disabled={disabled}>
      <FieldLegend variant="label">{question.header}</FieldLegend>
      <FieldDescription>{question.question}</FieldDescription>
      {question.multiSelect ? (
        <div className="grid gap-1.5">
          {question.options.map((option) => {
            const id = `${question.id}-${option.id}`;
            const isChecked = selected.includes(option.label);
            return (
              <FieldLabel key={option.id} htmlFor={id}>
                <Field orientation="horizontal">
                  <Checkbox
                    id={id}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      onSelect(
                        checked
                          ? [...selected, option.label]
                          : selected.filter((label) => label !== option.label),
                      )
                    }
                  />
                  <FieldContent>
                    <FieldTitle>{option.label}</FieldTitle>
                    {option.description && (
                      <FieldDescription>{option.description}</FieldDescription>
                    )}
                  </FieldContent>
                </Field>
              </FieldLabel>
            );
          })}
        </div>
      ) : (
        <RadioGroup
          className="gap-1.5"
          value={selected[0] ?? ""}
          onValueChange={(label) => onSelect([label])}
        >
          {question.options.map((option) => {
            const id = `${question.id}-${option.id}`;
            return (
              <FieldLabel key={option.id} htmlFor={id}>
                <Field orientation="horizontal">
                  <RadioGroupItem id={id} value={option.label} />
                  <FieldContent>
                    <FieldTitle>{option.label}</FieldTitle>
                    {option.description && (
                      <FieldDescription>{option.description}</FieldDescription>
                    )}
                  </FieldContent>
                </Field>
              </FieldLabel>
            );
          })}
        </RadioGroup>
      )}
      <Textarea
        aria-label={`Other answer for: ${question.question}`}
        placeholder="Something else? Add details…"
        value={customText}
        onChange={(event) => onCustomText(event.target.value)}
      />
    </FieldSet>
  );
}

function QuestionsTask({
  data,
  disabled,
  onResolve,
}: PendingTaskProps & { data: QuestionsData }) {
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [customText, setCustomText] = useState<Record<string, string>>({});

  const isAnswered = (question: Question) =>
    (selected[question.id]?.length ?? 0) > 0 ||
    Boolean(customText[question.id]?.trim());
  const canSubmit =
    data.questions.length > 0 && data.questions.every(isAnswered);

  const submit = () =>
    onResolve({
      type: "answered-questions",
      answers: data.questions.map((question) => {
        const extra = customText[question.id]?.trim();
        return {
          questionId: question.id,
          questionText: question.question,
          selectedLabels: selected[question.id] ?? [],
          ...(extra && { customText: extra }),
        };
      }),
    });

  return (
    <TaskCard
      icon={HelpCircleIcon}
      title={
        data.questions.length === 1
          ? "v0 has a question"
          : "v0 has a few questions"
      }
      description="Answer so v0 can build exactly what you want."
    >
      <div className="grid gap-4">
        {data.questions.map((question) => (
          <QuestionField
            key={question.id}
            question={question}
            disabled={disabled}
            selected={selected[question.id] ?? []}
            customText={customText[question.id] ?? ""}
            onSelect={(labels) =>
              setSelected((current) => ({ ...current, [question.id]: labels }))
            }
            onCustomText={(text) =>
              setCustomText((current) => ({ ...current, [question.id]: text }))
            }
          />
        ))}
      </div>
      <Button
        className="justify-self-start"
        disabled={disabled || !canSubmit}
        onClick={submit}
      >
        Submit answers
      </Button>
    </TaskCard>
  );
}

function PlanTask({
  data,
  disabled,
  onResolve,
}: PendingTaskProps & { data: PlanData }) {
  const [feedback, setFeedback] = useState("");
  const trimmed = feedback.trim();

  const respond = (status: "approved" | "rejected" | "request-changes") =>
    onResolve({
      type: "plan-exit-response",
      status,
      content:
        trimmed ||
        (status === "approved"
          ? "Proceed with this plan."
          : "Don't proceed with this plan."),
    });

  return (
    <TaskCard
      icon={CheckListIcon}
      title="Review the plan"
      description={data.summary ?? "v0 wants your go-ahead before building."}
    >
      <ScrollArea
        className="rounded-md bg-muted/40 text-xs"
        viewportClassName="max-h-80 [&>div]:block!"
      >
        <div className="p-3">
          <Response>{data.plan}</Response>
        </div>
      </ScrollArea>
      <Textarea
        aria-label="Feedback on the plan"
        placeholder="Anything to change? (optional)"
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        disabled={disabled}
      />
      <div className="flex flex-wrap gap-2">
        <Button disabled={disabled} onClick={() => respond("approved")}>
          Approve plan
        </Button>
        <Button
          variant="outline"
          disabled={disabled || !trimmed}
          onClick={() => respond("request-changes")}
        >
          Request changes
        </Button>
        <Button
          variant="ghost"
          disabled={disabled}
          onClick={() => respond("rejected")}
        >
          Reject
        </Button>
      </div>
    </TaskCard>
  );
}

function IntegrationTask({
  chatId,
  data,
  disabled,
  vercelProjectId: initialProjectId,
  onResolve,
}: PendingTaskProps & { data: IntegrationData }) {
  const [projectId, setProjectId] = useState(initialProjectId);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const requested = [
    ...data.requestedIntegrations,
    ...data.requestedMcpPresets,
  ];
  const needsProject = data.requestedIntegrations.length > 0 && !projectId;

  const createProject = async () => {
    setIsCreatingProject(true);
    try {
      const { vercelProjectId } = await createVercelProject(chatId);
      setProjectId(vercelProjectId);
      toast.success("Vercel project created");
    } catch (error) {
      toast.error(describeChatError(error).message);
    }
    setIsCreatingProject(false);
  };

  const resolve = (connected: boolean) =>
    onResolve({
      type: "confirmed-steps",
      connectedIntegrationNames: connected ? data.requestedIntegrations : [],
      connectedMcpPresetNames: connected
        ? data.requestedMcpPresets.filter(isMcpPreset)
        : [],
      appliedScripts: [],
      addedEnvVars: [],
    });

  return (
    <TaskCard
      icon={Plug01Icon}
      title="Connect services"
      description="Connect these on Vercel or v0.app, then confirm here."
    >
      {requested.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {requested.map((name) => (
            <li
              key={name}
              className="rounded-md bg-muted px-2 py-1 font-medium"
            >
              {name}
            </li>
          ))}
        </ul>
      )}
      {data.requestedIntegrations.length > 0 &&
        (projectId ? (
          <p className="text-muted-foreground">
            Linked to Vercel project{" "}
            <span className="font-mono">{projectId}</span>
          </p>
        ) : (
          <div className="grid gap-1.5">
            <p className="text-muted-foreground">
              Integrations need a Vercel project for this chat first.
            </p>
            <Button
              className="justify-self-start"
              variant="outline"
              disabled={disabled || isCreatingProject}
              onClick={createProject}
            >
              {isCreatingProject && <Spinner data-icon="inline-start" />}
              Create Vercel project
            </Button>
          </div>
        ))}
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={disabled || needsProject}
          onClick={() => resolve(true)}
        >
          I've connected them
        </Button>
        <Button
          variant="ghost"
          disabled={disabled}
          onClick={() => resolve(false)}
        >
          Skip
        </Button>
      </div>
    </TaskCard>
  );
}

function PermissionsTask({
  permissions,
  disabled,
  onResolve,
  onRejectPermission,
}: PendingTaskProps & { permissions: Permission[] }) {
  const allow = () =>
    onResolve({
      type: "confirmed-permissions",
      permissions: permissions.map((permission) => ({
        ...permission,
        input: permission.input ?? {},
      })),
    });

  return (
    <TaskCard
      icon={Shield01Icon}
      title="Permission needed"
      description="v0 wants to run a tool that can change things outside this chat."
    >
      <div className="grid gap-2">
        {permissions.map((permission) => (
          <div
            key={`${permission.toolName}-${permission.taskNameActive ?? ""}`}
            className="rounded-md bg-muted/40 p-2.5"
          >
            <p className="font-medium">
              {permission.toolDisplayName ?? permission.toolName}
            </p>
            {permission.userMessage && (
              <p className="mt-0.5 text-muted-foreground">
                {permission.userMessage}
              </p>
            )}
            {permission.input !== undefined && (
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-[0.6875rem] text-muted-foreground">
                {JSON.stringify(permission.input, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button disabled={disabled} onClick={allow}>
          Allow
        </Button>
        <Button
          variant="outline"
          disabled={disabled}
          onClick={onRejectPermission}
        >
          Deny
        </Button>
      </div>
    </TaskCard>
  );
}

const CONNECT_POLL_MS = 2000;

function ConnectTask({
  chatId,
  request,
  disabled,
  onResolve,
}: PendingTaskProps & { request: ConnectRequest }) {
  const [isWaiting, setIsWaiting] = useState(false);
  const isSetup = request.status === "setup-required";

  const finish = () =>
    onResolve({
      type: isSetup ? "vercel-connect-setup" : "vercel-connect-authorization",
    });
  const finishRef = useLatestRef(finish);

  // biome-ignore lint/correctness/useExhaustiveDependencies: finishRef is a ref; reading .current at call time is the point
  useEffect(() => {
    if (!isWaiting) {
      return;
    }
    let cancelled = false;

    const check = async () => {
      const status = await fetchConnectStatus(chatId, request.requestId).catch(
        () => null,
      );
      if (cancelled || !status) {
        return;
      }
      if (status.status === "ready") {
        setIsWaiting(false);
        finishRef.current();
      } else if (status.status === "error") {
        setIsWaiting(false);
        toast.error(status.message ?? "The connection failed");
      }
    };

    const interval = setInterval(check, CONNECT_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isWaiting, chatId, request.requestId]);

  return (
    <TaskCard
      icon={Plug01Icon}
      title={`${isSetup ? "Set up" : "Authorize"} ${request.connectorName}`}
      description={`v0 needs access to ${request.service} through Vercel Connect.`}
    >
      <div className="flex flex-wrap gap-2">
        <Button asChild disabled={disabled}>
          <a
            href={request.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsWaiting(true)}
          >
            {isSetup ? "Open setup" : "Authorize"}
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              strokeWidth={2}
              data-icon="inline-end"
            />
          </a>
        </Button>
        <Button variant="outline" disabled={disabled} onClick={finish}>
          {isWaiting && <Spinner data-icon="inline-start" />}
          {isWaiting ? "Waiting… (done)" : "I've finished"}
        </Button>
      </div>
    </TaskCard>
  );
}
