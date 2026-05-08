import { NextResponse } from "next/server";
import { GenerateImageInputSchema, generateSlideImage } from "@/lib/image-generation";

export async function POST(request: Request) {
  try {
    const input = GenerateImageInputSchema.parse(await request.json());
    return NextResponse.json(await generateSlideImage(input));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
}
