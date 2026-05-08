import { nanoid } from "nanoid";
import type { Deck, GenerateDeckInput, Slide } from "./deck-schema";

const now = () => new Date().toISOString();
const slide = (partial: Omit<Slide, "id">): Slide => ({ id: nanoid(), ...partial });

export function buildFallbackDeck(input: GenerateDeckInput): Deck {
  const topic = input.prompt.replace(/\s+/g, " ").trim();
  const count = input.slideCount;
  const coreSlides: Slide[] = [
    slide({
      type: "title",
      title: topic.length > 72 ? `${topic.slice(0, 69)}...` : topic,
      subtitle: `A ${input.tone} presentation for ${input.audience}`,
      bullets: [],
      columns: [],
      speakerNotes: "Open with the audience's goal and why this topic matters.",
    }),
    slide({
      type: "section",
      title: "The Big Idea",
      subtitle: "What this presentation needs to make clear",
      body: "Frame the topic around one useful takeaway the audience can remember.",
      bullets: [],
      columns: [],
      speakerNotes: "Keep this concise; it sets the mental model for the rest of the deck.",
    }),
    slide({
      type: "bullets",
      title: "Why It Matters",
      bullets: [
        "Clarifies the current situation and audience need",
        "Highlights practical opportunities and constraints",
        "Creates a shared path for action or discussion",
      ],
      columns: [],
      speakerNotes: "Use this slide to connect the topic to the audience's real world.",
    }),
    slide({
      type: "twoColumn",
      title: "Key Considerations",
      bullets: [],
      columns: [
        { title: "What to prioritize", bullets: ["Clarity", "Speed", "Practical examples"] },
        { title: "What to avoid", bullets: ["Overloading slides", "Generic claims", "Unclear next steps"] },
      ],
      speakerNotes: "Contrast priorities with common mistakes.",
    }),
    slide({
      type: "timeline",
      title: "Suggested Path",
      bullets: ["Define the goal", "Gather source material", "Create the first version", "Review and refine", "Present or export"],
      columns: [],
      speakerNotes: "Walk through this as a practical execution plan.",
    }),
    slide({
      type: "comparison",
      title: "Options Compared",
      bullets: [],
      columns: [
        { title: "Simple approach", bullets: ["Fast", "Easy to explain", "Good for MVP"] },
        { title: "Advanced approach", bullets: ["More flexible", "More expensive", "Better after validation"] },
      ],
      speakerNotes: "Make the tradeoff explicit so the audience can choose confidently.",
    }),
    slide({
      type: "quote",
      title: "Guiding Principle",
      quote: "The best presentation is the one that helps the audience decide, learn, or act.",
      attribution: "DeckForge",
      bullets: [],
      columns: [],
      speakerNotes: "Use this as a reset before the closing slide.",
    }),
    slide({
      type: "closing",
      title: "Next Steps",
      bullets: ["Confirm the intended audience", "Refine the story", "Export and share", "Collect feedback for version two"],
      columns: [],
      speakerNotes: "End with a concrete call to action.",
    }),
  ];

  return {
    id: nanoid(),
    title: topic.length > 80 ? `${topic.slice(0, 77)}...` : topic,
    description: `Generated ${count}-slide deck for ${input.audience}.`,
    prompt: input.prompt,
    audience: input.audience,
    tone: input.tone,
    themeId: input.themeId,
    isPublic: false,
    slides: coreSlides.slice(0, count),
    createdAt: now(),
    updatedAt: now(),
  };
}
