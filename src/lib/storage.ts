import type { Deck } from "./deck-schema";

const KEY = "deckforge.decks";

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
