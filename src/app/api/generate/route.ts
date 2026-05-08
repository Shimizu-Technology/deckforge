import { NextResponse } from "next/server";
import { GenerateDeckInputSchema } from "@/lib/deck-schema";
import { generateDeck } from "@/lib/openrouter";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = GenerateDeckInputSchema.parse(body);
    const deck = await generateDeck(input);
    return NextResponse.json(deck);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
}
