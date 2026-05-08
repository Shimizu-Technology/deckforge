import type { Deck } from "./deck-schema";

const KEY = "deckforge.decks";

type DeckResponse = { ok: true; deck: Deck; persistence: true };
type DecksResponse = { ok: true; decks: Deck[]; persistence: true };

export function getLocalDecks(): Deck[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as Deck[];
  } catch {
    return [];
  }
}

export function saveLocalDeck(deck: Deck) {
  const decks = getLocalDecks();
  const next = [deck, ...decks.filter((item) => item.id !== deck.id)];
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function getLocalDeck(id: string) {
  return getLocalDecks().find((deck) => deck.id === id) ?? null;
}

export function deleteLocalDeck(id: string) {
  const decks = getLocalDecks().filter((deck) => deck.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(decks));
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(input, init);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getDecks(): Promise<{ decks: Deck[]; source: "server" | "local" }> {
  const result = await fetchJson<DecksResponse>("/api/decks");
  if (result?.ok) return { decks: result.decks, source: "server" };
  return { decks: getLocalDecks(), source: "local" };
}

export async function saveDeck(deck: Deck): Promise<"server" | "local"> {
  const result = await fetchJson<DeckResponse>("/api/decks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(deck),
  });

  if (result?.ok) {
    saveLocalDeck(result.deck);
    return "server";
  }

  saveLocalDeck(deck);
  return "local";
}

export async function updateDeck(deck: Deck): Promise<"server" | "local"> {
  const result = await fetchJson<DeckResponse>(`/api/decks/${encodeURIComponent(deck.id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(deck),
  });

  if (result?.ok) {
    saveLocalDeck(result.deck);
    return "server";
  }

  saveLocalDeck(deck);
  return "local";
}

export async function getDeck(id: string): Promise<{ deck: Deck | null; source: "server" | "local" }> {
  const result = await fetchJson<DeckResponse>(`/api/decks/${encodeURIComponent(id)}`);
  if (result?.ok) {
    saveLocalDeck(result.deck);
    return { deck: result.deck, source: "server" };
  }

  return { deck: getLocalDeck(id), source: "local" };
}

export async function deleteDeck(id: string): Promise<"server" | "local"> {
  const result = await fetchJson<{ ok: true; persistence: true }>(`/api/decks/${encodeURIComponent(id)}`, { method: "DELETE" });
  deleteLocalDeck(id);
  return result?.ok ? "server" : "local";
}
