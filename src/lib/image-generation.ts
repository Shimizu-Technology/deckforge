import { z } from "zod";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const GenerateImageInputSchema = z.object({
  prompt: z.string().min(8),
  title: z.string().optional(),
  themeId: z.string().optional(),
});

export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

function svgFallback(input: GenerateImageInput) {
  const title = (input.title || "DeckForge visual").replace(/[<>&]/g, "");
  const prompt = input.prompt.replace(/[<>&]/g, "").slice(0, 180);
  const dark = input.themeId === "aurora" || input.themeId === "midnight";
  const bg1 = dark ? "#020617" : "#fff7ed";
  const bg2 = dark ? "#312e81" : "#fed7aa";
  const fg = dark ? "#f8fafc" : "#0f172a";
  const accent = dark ? "#67e8f9" : "#f97316";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="864" viewBox="0 0 1536 864">
  <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient><filter id="b"><feGaussianBlur stdDeviation="45"/></filter></defs>
  <rect width="1536" height="864" rx="56" fill="url(#g)"/>
  <circle cx="1220" cy="130" r="210" fill="${accent}" opacity="0.28" filter="url(#b)"/>
  <circle cx="230" cy="760" r="260" fill="${accent}" opacity="0.18" filter="url(#b)"/>
  <rect x="92" y="92" width="1352" height="680" rx="44" fill="#ffffff" opacity="0.08" stroke="${accent}" stroke-opacity="0.35"/>
  <text x="132" y="178" fill="${accent}" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" letter-spacing="8">DECKFORGE VISUAL</text>
  <text x="132" y="332" fill="${fg}" font-family="Arial, Helvetica, sans-serif" font-size="82" font-weight="900">${title}</text>
  <foreignObject x="132" y="390" width="1050" height="250"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,Helvetica,sans-serif;color:${fg};font-size:36px;line-height:1.35;opacity:.82">${prompt}</div></foreignObject>
  <path d="M1150 600 L1240 445 L1330 600 Z" fill="${accent}" opacity="0.9"/><circle cx="1198" cy="420" r="42" fill="${fg}" opacity="0.75"/>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function findDataUrl(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") {
    const match = value.match(/data:image\/(?:png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+/);
    return match?.[0] ?? null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findDataUrl(item);
      if (found) return found;
    }
  }
  if (typeof value === "object") {
    for (const item of Object.values(value as Record<string, unknown>)) {
      const found = findDataUrl(item);
      if (found) return found;
    }
  }
  return null;
}

export async function generateSlideImage(input: GenerateImageInput): Promise<{ imageUrl: string; provider: "openrouter" | "fallback" }> {
  const parsed = GenerateImageInputSchema.parse(input);
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return { imageUrl: svgFallback(parsed), provider: "fallback" };

  const prompt = `Create a clean 16:9 presentation slide illustration. No text, no labels, no watermarks. Make it polished, modern, and useful as a visual for this slide. Slide title: ${parsed.title || "Untitled"}. Visual brief: ${parsed.prompt}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 75_000);
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "DeckForge",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_IMAGE_MODEL ?? "openai/gpt-5.4-image-2",
        modalities: ["image", "text"],
        messages: [{ role: "user", content: prompt }],
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error("OpenRouter image generation failed", await response.text());
      return { imageUrl: svgFallback(parsed), provider: "fallback" };
    }

    const payload = await response.json();
    const imageUrl = findDataUrl(payload);
    if (!imageUrl) {
      console.error("OpenRouter image generation returned no data URL", JSON.stringify(payload).slice(0, 1000));
      return { imageUrl: svgFallback(parsed), provider: "fallback" };
    }

    return { imageUrl, provider: "openrouter" };
  } catch (error) {
    console.error("OpenRouter image generation crashed", error);
    return { imageUrl: svgFallback(parsed), provider: "fallback" };
  }
}
