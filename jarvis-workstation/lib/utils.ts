import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function debounced(...args: Parameters<T>): void {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function formatDate(date: Date): string {
  return date.toLocaleString();
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString();
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + "...";
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
    document.body.removeChild(textArea);
    return Promise.resolve();
  }
}

export function downloadFile(
  content: string,
  filename: string,
  type: string = "text/plain",
): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function isValidCode(code: string): boolean {
  try {
    // Basic validation - check if it's valid JavaScript/TypeScript
    if (code.trim() === "") return false;

    // Check for basic syntax errors
    const lines = code.split("\n");
    let braceCount = 0;
    let parenCount = 0;
    let bracketCount = 0;

    for (const line of lines) {
      for (const char of line) {
        switch (char) {
          case "{":
            braceCount++;
            break;
          case "}":
            braceCount--;
            break;
          case "(":
            parenCount++;
            break;
          case ")":
            parenCount--;
            break;
          case "[":
            bracketCount++;
            break;
          case "]":
            bracketCount--;
            break;
        }
      }
    }

    return braceCount === 0 && parenCount === 0 && bracketCount === 0;
  } catch {
    return false;
  }
}

export function extractImports(code: string): string[] {
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  const imports: string[] = [];
  let match;

  while ((match = importRegex.exec(code)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

export function extractExports(code: string): string[] {
  const exportRegex =
    /export\s+(?:default\s+)?(?:function|const|class|interface|type)\s+(\w+)/g;
  const exports: string[] = [];
  let match;

  while ((match = exportRegex.exec(code)) !== null) {
    exports.push(match[1]);
  }

  return exports;
}
