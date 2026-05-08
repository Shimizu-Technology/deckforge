import { NextResponse } from "next/server";
import pptxgen from "pptxgenjs";
import { DeckSchema, type Slide } from "@/lib/deck-schema";

const layout = "LAYOUT_WIDE" as const;
const colors: Record<string, { bg: string; fg: string; accent: string; muted: string }> = {
  aurora: { bg: "111827", fg: "FFFFFF", accent: "67E8F9", muted: "C7D2FE" },
  classroom: { bg: "FFF7ED", fg: "0F172A", accent: "F97316", muted: "475569" },
  boardroom: { bg: "F8FAFC", fg: "0F172A", accent: "0F172A", muted: "475569" },
  midnight: { bg: "020617", fg: "F8FAFC", accent: "60A5FA", muted: "D4D4D8" },
};

function addBullets(slide: pptxgen.Slide, items: string[] = [], color: string) {
  if (!items.length) return;
  slide.addText(items.map((text) => ({ text, options: { bullet: { type: "bullet" } } })), {
    x: 0.9,
    y: 2.7,
    w: 11.4,
    h: 3.2,
    fontSize: 22,
    color,
    breakLine: false,
    fit: "shrink",
  });
}

function renderSlide(pres: pptxgen, item: Slide, index: number, deckTitle: string, palette: { bg: string; fg: string; accent: string; muted: string }) {
  const slide = pres.addSlide();
  slide.background = { color: palette.bg };
  slide.addShape(pres.ShapeType.arc, { x: 11, y: -0.5, w: 2.4, h: 2.4, fill: { color: palette.accent, transparency: 55 }, line: { transparency: 100 } });
  slide.addText(item.type.toUpperCase(), { x: 0.7, y: 0.5, w: 2.4, h: 0.35, fontSize: 9, bold: true, color: palette.bg, fill: { color: palette.accent }, margin: 0.08, align: "center" });
  slide.addText(item.title, { x: 0.7, y: 1.05, w: 11.3, h: 1.2, fontSize: item.title.length > 45 ? 34 : 44, bold: true, color: palette.fg, fit: "shrink" });
  if (item.subtitle) slide.addText(item.subtitle, { x: 0.75, y: 2.1, w: 10.8, h: 0.5, fontSize: 18, color: palette.muted, fit: "shrink" });

  if (item.quote) {
    slide.addText(`“${item.quote}”`, { x: 1, y: 2.75, w: 10.8, h: 1.6, fontSize: 30, bold: true, color: palette.fg, fit: "shrink" });
    if (item.attribution) slide.addText(`— ${item.attribution}`, { x: 1, y: 4.55, w: 6, h: 0.4, fontSize: 16, color: palette.muted });
  } else if (item.columns?.length) {
    item.columns.slice(0, 2).forEach((column, columnIndex) => {
      const x = columnIndex === 0 ? 0.8 : 6.8;
      slide.addShape(pres.ShapeType.roundRect, { x, y: 2.75, w: 5.6, h: 2.9, rectRadius: 0.15, fill: { color: "FFFFFF", transparency: palette.bg === "F8FAFC" || palette.bg === "FFF7ED" ? 0 : 88 }, line: { color: palette.accent, transparency: 50 } });
      slide.addText(column.title, { x: x + 0.3, y: 3.05, w: 5, h: 0.35, fontSize: 20, bold: true, color: palette.fg });
      slide.addText(column.bullets.map((text) => ({ text, options: { bullet: { type: "bullet" } } })), { x: x + 0.45, y: 3.55, w: 4.8, h: 1.8, fontSize: 16, color: palette.fg, fit: "shrink" });
    });
  } else {
    addBullets(slide, item.bullets, palette.fg);
  }

  if (item.speakerNotes) slide.addNotes(item.speakerNotes);
  slide.addText(deckTitle, { x: 0.7, y: 7.05, w: 8, h: 0.2, fontSize: 9, color: palette.muted });
  slide.addText(String(index + 1), { x: 12.1, y: 7.05, w: 0.5, h: 0.2, fontSize: 9, color: palette.muted, align: "right" });
}

export async function POST(request: Request) {
  try {
    const deck = DeckSchema.parse(await request.json());
    const pres = new pptxgen();
    pres.layout = layout;
    pres.author = "DeckForge";
    pres.subject = deck.description ?? deck.title;
    pres.title = deck.title;
    pres.company = "Shimizu Technology";
    const palette = colors[deck.themeId] ?? colors.aurora;
    deck.slides.forEach((slide, index) => renderSlide(pres, slide, index, deck.title, palette));
    const data = await pres.write({ outputType: "nodebuffer" });
    return new NextResponse(data as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${deck.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "deck"}.pptx"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Export failed" }, { status: 400 });
  }
}
