export type FontPairing = {
  heading: string;
  body: string[];
};

export const FONT_PAIRINGS: FontPairing[] = [
  { heading: "Bebas", body: ["FontinSans", "Inconsolata", "CaviarDreams"] },
  { heading: "Chunk", body: ["Calluna", "GoudyBookletter1911", "Fontin"] },
  { heading: "College", body: ["FontinSans", "Cicle"] },
  { heading: "Commando", body: ["FontinSans", "Cicle"] },
  { heading: "ChantelliAntiqua", body: ["CaviarDreams", "FontinSans"] },
  { heading: "Gabrielle", body: ["Cicle", "Inconsolata", "FontinSans"] },
  { heading: "HollaScript", body: ["Cicle", "Inconsolata", "FontinSans"] },
  { heading: "HoneyScript", body: ["Cicle", "Inconsolata", "FontinSans"] },
  { heading: "Carrington", body: ["Fontin", "GoudyBookletter1911"] },
  { heading: "Calluna", body: ["Fontin", "GoudyBookletter1911"] },
  { heading: "Boycott", body: ["Inconsolata", "Cicle"] },
  { heading: "Downcome", body: ["Inconsolata", "Cicle"] },
  { heading: "Deftone", body: ["Inconsolata", "Cicle"] },
  { heading: "BlackCasper", body: ["FontinSans", "CaviarDreams"] },
  { heading: "BlackRose", body: ["FontinSans", "CaviarDreams"] },
  { heading: "Broken15", body: ["FontinSans", "CaviarDreams"] },
  { heading: "GreenFuz", body: ["Cicle", "Inconsolata"] },
  { heading: "GothicUltra", body: ["Cicle", "Inconsolata"] },
  { heading: "GoodDog", body: ["CaviarDreams", "FontinSans"] },
  { heading: "Gesso", body: ["CaviarDreams", "FontinSans"] },
  { heading: "ComicZine", body: ["CaviarDreams", "FontinSans"] },
  { heading: "BallparkWeiner", body: ["Cicle", "Inconsolata"] },
  { heading: "HatCheck", body: ["Cicle", "Inconsolata"] },
  { heading: "Cloister", body: ["Fontin", "Calluna"] },
  { heading: "GoudyBookletter1911", body: ["Fontin", "Calluna"] },
  { heading: "GoudyTwenty", body: ["Fontin", "Calluna"] },
  { heading: "Amadeus", body: ["CaviarDreams", "FontinSans"] },
  { heading: "ChopinScript", body: ["CaviarDreams", "FontinSans"] },
];

export function getSuggestedPairings(headingFont: string): string[] {
  const pairing = FONT_PAIRINGS.find((p) => p.heading === headingFont);
  return pairing?.body ?? [];
}

export type PairingPreset = {
  name: string;
  heading: string;
  body: string;
};

export const PAIRING_PRESETS: PairingPreset[] = [
  { name: "Modern Clean", heading: "Bebas", body: "FontinSans" },
  { name: "Classic Serif", heading: "Chunk", body: "Calluna" },
  { name: "Elegant Script", heading: "ChopinScript", body: "CaviarDreams" },
  { name: "Bold Impact", heading: "Boycott", body: "Inconsolata" },
  { name: "Vintage Charm", heading: "GoudyBookletter1911", body: "Fontin" },
  { name: "Playful & Friendly", heading: "GoodDog", body: "CaviarDreams" },
  { name: "Sharp Street", heading: "GothicUltra", body: "Cicle" },
  { name: "Handwritten Warmth", heading: "Gabrielle", body: "FontinSans" },
  { name: "University Style", heading: "College", body: "FontinSans" },
  { name: "Romantic Pair", heading: "Amadeus", body: "FontinSans" },
];
