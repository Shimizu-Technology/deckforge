import { PresentDeck } from "@/components/present-deck";

export default async function PresentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PresentDeck id={id} />;
}
