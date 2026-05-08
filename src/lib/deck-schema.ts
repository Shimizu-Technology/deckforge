import { z } from "zod";

export const slideTypes = [
  "title",
  "section",
  "bullets",
  "twoColumn",
  "quote",
  "comparison",
  "timeline",
  "closing",
] as const;

export const SlideSchema = z.object({
  id: z.string(),
  type: z.enum(slideTypes),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  bullets: z.array(z.string()).default([]),
  columns: z
    .array(
      z.object({
        title: z.string(),
        bullets: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  quote: z.string().optional(),
  attribution: z.string().optional(),
  speakerNotes: z.string().optional(),
  visualPrompt: z.string().optional(),
});

export const DeckSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  prompt: z.string().optional(),
  audience: z.string().optional(),
  tone: z.string().optional(),
  themeId: z.string().default("aurora"),
  isPublic: z.boolean().default(false),
  slides: z.array(SlideSchema).min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GenerateDeckInputSchema = z.object({
  prompt: z.string().min(10),
  sourceText: z.string().optional(),
  audience: z.string().default("general audience"),
  tone: z.string().default("clear and practical"),
  slideCount: z.number().int().min(3).max(16).default(8),
  themeId: z.string().default("aurora"),
});

export type SlideType = (typeof slideTypes)[number];
export type Slide = z.infer<typeof SlideSchema>;
export type Deck = z.infer<typeof DeckSchema>;
export type GenerateDeckInput = z.infer<typeof GenerateDeckInputSchema>;
