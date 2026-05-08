import { DeckEditor } from "@/components/editor";

export default async function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DeckEditor id={id} />;
}
