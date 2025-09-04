export async function fetchGroqResponse(prompt: string): Promise<string> {
  const response = await fetch("/api/groq", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch from Groq API");
  }

  const data = await response.json();
  if (!data.code) {
    throw new Error("No code returned from Groq API");
  }
  return data.code;
}

export function generatePrompt(action: string, context?: string): string {
  const basePrompts = {
    "generate-component": "Generate a modern React component with TypeScript",
    "refactor-code":
      "Refactor this React code for better performance and maintainability",
    "fix-bugs": "Identify and fix bugs in this React code",
    optimize: "Optimize this React code for performance",
    "add-types": "Add TypeScript types to this React code",
    "add-tests": "Generate unit tests for this React component",
    "add-storybook": "Generate Storybook stories for this React component",
    "convert-to-hooks":
      "Convert this class component to functional component with hooks",
    "add-accessibility": "Add accessibility features to this React component",
    "responsive-design":
      "Make this React component responsive for mobile and desktop",
  };

  const basePrompt =
    basePrompts[action as keyof typeof basePrompts] || "Generate React code";

  if (context) {
    return `${basePrompt}:\n\n${context}`;
  }

  return basePrompt;
}

export function createSystemPrompt(
  componentType: string = "component",
): string {
  return `You are an expert React developer. Generate clean, modern, and production-ready React code.

Requirements:
- Use functional components with hooks
- Include TypeScript types
- Follow React best practices
- Add proper error handling
- Include JSDoc comments for complex functions
- Use modern ES6+ syntax
- Make components reusable and modular
- Include proper imports and exports
- Follow accessibility guidelines (ARIA attributes, semantic HTML)
- Use CSS modules or styled-components for styling
- Include PropTypes or TypeScript interfaces

Return only the code, no explanations unless specifically requested.`;
}

export function validateGeneratedCode(code: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Basic validation checks
  if (!code.trim()) {
    errors.push("Code is empty");
    return { isValid: false, errors };
  }

  // Check for React imports
  if (!code.includes("import") && !code.includes("from")) {
    errors.push("Missing imports");
  }

  // Check for basic React structure
  if (
    !code.includes("export") &&
    !code.includes("function") &&
    !code.includes("const")
  ) {
    errors.push("Missing component definition");
  }

  // Check for balanced braces
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push("Unbalanced braces");
  }

  // Check for balanced parentheses
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push("Unbalanced parentheses");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function formatCodeForPreview(code: string): string {
  // Clean up the code for better preview
  let formattedCode = code.trim();

  // Remove any markdown code blocks if present
  formattedCode = formattedCode.replace(
    /```(?:jsx?|tsx?|javascript|typescript)?\n?/g,
    "",
  );
  formattedCode = formattedCode.replace(/```\n?/g, "");

  // Ensure proper line endings
  formattedCode = formattedCode.replace(/\r\n/g, "\n");

  return formattedCode;
}

export function extractComponentName(code: string): string {
  // Try to extract component name from various patterns
  const patterns = [
    /export\s+(?:default\s+)?(?:function|const)\s+(\w+)/,
    /function\s+(\w+)\s*\(/,
    /const\s+(\w+)\s*=\s*(?:\(|function)/,
    /export\s+(\w+)\s*=/,
  ];

  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return "Component";
}

export function generateFileExtension(code: string): string {
  // Determine if it's TypeScript or JavaScript
  if (
    code.includes("interface ") ||
    code.includes("type ") ||
    code.includes(": ")
  ) {
    return ".tsx";
  }
  return ".jsx";
}
