import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that generates React code based on user prompts. 
          
          Guidelines:
          - Always generate clean, modern React code
          - Use TypeScript when appropriate
          - Include proper imports and exports
          - Follow React best practices
          - Add comments for complex logic
          - Use functional components with hooks
          - Include proper error handling
          - Make components reusable and modular
          
          Return only the code, no explanations unless specifically asked.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: process.env.GROQ_MODEL || "llama3-70b-8192",
      temperature: 0.7,
      max_tokens: 2048,
    });

    const code = response.choices[0]?.message?.content || "";

    return NextResponse.json({
      code,
      usage: response.usage,
      model: response.model,
    });
  } catch (error) {
    console.error("Error calling Groq API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch from Groq API",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
