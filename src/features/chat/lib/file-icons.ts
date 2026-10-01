import {
  Css3Icon,
  FileBracesIcon,
  FileCodeIcon,
  FileCogIcon,
  FileImageIcon,
  FileKeyIcon,
  FileLockIcon,
  FileTerminalIcon,
  FileTextIcon,
  Html5Icon,
  JavaScriptIcon,
  NpmIcon,
  PythonIcon,
  ReactIcon,
  SqlIcon,
  SvgIcon,
  TailwindcssIcon,
  TypescriptIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export interface FileIcon {
  icon: IconSvgElement;
  className: string;
}

const MUTED = "text-muted-foreground";

const BY_NAME: Record<string, FileIcon> = {
  "package.json": { icon: NpmIcon, className: "text-red-500" },
  "package-lock.json": { icon: FileLockIcon, className: MUTED },
  "pnpm-lock.yaml": { icon: FileLockIcon, className: MUTED },
  "yarn.lock": { icon: FileLockIcon, className: MUTED },
  "bun.lockb": { icon: FileLockIcon, className: MUTED },
  ".gitignore": { icon: FileCogIcon, className: MUTED },
};

const BY_EXTENSION: Record<string, FileIcon> = {
  tsx: { icon: ReactIcon, className: "text-sky-500" },
  jsx: { icon: ReactIcon, className: "text-sky-500" },
  ts: { icon: TypescriptIcon, className: "text-blue-600 dark:text-blue-400" },
  mts: { icon: TypescriptIcon, className: "text-blue-600 dark:text-blue-400" },
  cts: { icon: TypescriptIcon, className: "text-blue-600 dark:text-blue-400" },
  js: { icon: JavaScriptIcon, className: "text-yellow-500" },
  mjs: { icon: JavaScriptIcon, className: "text-yellow-500" },
  cjs: { icon: JavaScriptIcon, className: "text-yellow-500" },
  css: { icon: Css3Icon, className: "text-indigo-500" },
  scss: { icon: Css3Icon, className: "text-pink-500" },
  html: { icon: Html5Icon, className: "text-orange-600" },
  json: { icon: FileBracesIcon, className: "text-amber-500" },
  md: { icon: FileTextIcon, className: MUTED },
  mdx: { icon: FileTextIcon, className: "text-amber-600" },
  txt: { icon: FileTextIcon, className: MUTED },
  svg: { icon: SvgIcon, className: "text-amber-600" },
  png: { icon: FileImageIcon, className: "text-emerald-500" },
  jpg: { icon: FileImageIcon, className: "text-emerald-500" },
  jpeg: { icon: FileImageIcon, className: "text-emerald-500" },
  gif: { icon: FileImageIcon, className: "text-emerald-500" },
  webp: { icon: FileImageIcon, className: "text-emerald-500" },
  avif: { icon: FileImageIcon, className: "text-emerald-500" },
  ico: { icon: FileImageIcon, className: "text-emerald-500" },
  py: { icon: PythonIcon, className: "text-blue-500" },
  sql: { icon: SqlIcon, className: "text-cyan-600" },
  sh: { icon: FileTerminalIcon, className: MUTED },
  yml: { icon: FileCogIcon, className: "text-rose-500" },
  yaml: { icon: FileCogIcon, className: "text-rose-500" },
  toml: { icon: FileCogIcon, className: MUTED },
};

const DEFAULT_ICON: FileIcon = { icon: FileCodeIcon, className: MUTED };

export function getFileIcon(path: string): FileIcon {
  const name = path.slice(path.lastIndexOf("/") + 1).toLowerCase();
  const byName = BY_NAME[name];
  if (byName) {
    return byName;
  }
  if (name === ".env" || name.startsWith(".env.")) {
    return { icon: FileKeyIcon, className: "text-yellow-600" };
  }
  if (name.startsWith("tailwind.config.")) {
    return { icon: TailwindcssIcon, className: "text-cyan-500" };
  }
  if (/\.config\.[cm]?[jt]s$/.test(name)) {
    return { icon: FileCogIcon, className: MUTED };
  }
  const extension = name.includes(".") ? name.split(".").pop() : undefined;
  return (extension && BY_EXTENSION[extension]) || DEFAULT_ICON;
}
