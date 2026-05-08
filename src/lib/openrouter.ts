import { nanoid } from "nanoid";
import { DeckSchema, GenerateDeckInputSchema, type Deck, type GenerateDeckInput } from "./deck-schema";
import { buildFallbackDeck } from "./sample";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function stripCodeFence(value: string) {
  return value.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}

export async function generateDeck(input: GenerateDeckInput): Promise<Deck> {
  const parsed = GenerateDeckInputSchema.parse(input);
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) return buildFallbackDeck(parsed);

  const schemaHint = `Return ONLY valid JSON matching this TypeScript shape:
{
  "title": string,
  "description": string,
  "slides": Array<{
    "type": "title" | "section" | "bullets" | "twoColumn" | "quote" | "comparison" | "timeline" | "closing",
    "title": string,
    "subtitle"?: string,
    "body"?: string,
    "bullets"?: string[],
    "columns"?: { "title": string, "bullets": string[] }[],
    "quote"?: string,
    "attribution"?: string,
    "speakerNotes"?: string,
    "visualPrompt"?: string
  }>
}`;

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "DeckForge",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash-lite",
      messages: [
        {
          role: "system",
          content:
            "You are DeckForge, an expert presentation strategist. Create practical, non-generic decks with concise slide copy, strong structure, and useful speaker notes. Never output markdown. Never output commentary outside JSON.",
        },
        {
          role: "user",
          content: `${schemaHint}\n\nCreate ${parsed.slideCount} slides.\nAudience: ${parsed.audience}\nTone: ${parsed.tone}\nTopic/prompt: ${parsed.prompt}\nSource material: ${parsed.sourceText || "None provided"}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    console.error("OpenRouter failed", await response.text());
    return buildFallbackDeck(parsed);
  }

  const payload = await response.json();
  const raw = payload?.choices?.[0]?.message?.content;
  if (!raw || typeof raw !== "string") return buildFallbackDeck(parsed);

  try {
    const aiDeck = JSON.parse(stripCodeFence(raw));
    const now = new Date().toISOString();
    return DeckSchema.parse({
      id: nanoid(),
      title: aiDeck.title,
      description: aiDeck.description,
      prompt: parsed.prompt,
      audience: parsed.audience,
      tone: parsed.tone,
      themeId: parsed.themeId,
      isPublic: false,
      slides: aiDeck.slides.map((item: Record<string, unknown>) => ({
        id: nanoid(),
        bullets: [],
        columns: [],
        ...item,
      })),
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error("Failed to parse AI deck", error, raw);
    return buildFallbackDeck(parsed);
  }
}
