import * as Font from "expo-font";

export type FontCategory =
  | "Clean / Sans"
  | "Elegant / Script"
  | "Bold / Display"
  | "Vintage / Classic"
  | "Edgy / Street"
  | "Playful / Casual"
  | "System";

export type FontEntry = {
  name: string;
  displayName: string;
  category: FontCategory;
};

export const FONT_REGISTRY: FontEntry[] = [
  // System defaults (always available)
  { name: "System", displayName: "System Default", category: "System" },

  // Clean / Sans
  { name: "Aller", displayName: "Aller", category: "Clean / Sans" },
  { name: "AllerDisplay", displayName: "Aller Display", category: "Clean / Sans" },
  { name: "Anivers", displayName: "Anivers", category: "Clean / Sans" },
  { name: "CaviarDreams", displayName: "Caviar Dreams", category: "Clean / Sans" },
  { name: "Cicle", displayName: "Cicle", category: "Clean / Sans" },
  { name: "Droid", displayName: "Droid", category: "Clean / Sans" },
  { name: "Edmunds", displayName: "Edmunds", category: "Clean / Sans" },
  { name: "Folks", displayName: "Folks", category: "Clean / Sans" },
  { name: "FontinSans", displayName: "Fontin Sans", category: "Clean / Sans" },
  { name: "Inconsolata", displayName: "Inconsolata", category: "Clean / Sans" },

  // Elegant / Script
  { name: "Amadeus", displayName: "Amadeus", category: "Elegant / Script" },
  { name: "Angelina", displayName: "Angelina", category: "Elegant / Script" },
  { name: "BlackJack", displayName: "Black Jack", category: "Elegant / Script" },
  { name: "BrockScript", displayName: "Brock Script", category: "Elegant / Script" },
  { name: "Candela", displayName: "Candela", category: "Elegant / Script" },
  { name: "Carousel", displayName: "Carousel", category: "Elegant / Script" },
  { name: "ChopinScript", displayName: "Chopin Script", category: "Elegant / Script" },
  { name: "Gabrielle", displayName: "Gabrielle", category: "Elegant / Script" },
  { name: "HollaScript", displayName: "Holla Script", category: "Elegant / Script" },
  { name: "HoneyScript", displayName: "Honey Script", category: "Elegant / Script" },
  { name: "ChantelliAntiqua", displayName: "Chantelli Antiqua", category: "Elegant / Script" },

  // Bold / Display
  { name: "Bebas", displayName: "Bebas", category: "Bold / Display" },
  { name: "Chunk", displayName: "Chunk", category: "Bold / Display" },
  { name: "College", displayName: "College", category: "Bold / Display" },
  { name: "Commando", displayName: "Commando", category: "Bold / Display" },
  { name: "Boycott", displayName: "Boycott", category: "Bold / Display" },
  { name: "Deftone", displayName: "Deftone", category: "Bold / Display" },
  { name: "Downcome", displayName: "Downcome", category: "Bold / Display" },
  { name: "ElliotSix", displayName: "Elliot Six", category: "Bold / Display" },
  { name: "GothicUltra", displayName: "Gothic Ultra", category: "Bold / Display" },
  { name: "HattoriHanzo", displayName: "Hattori Hanzo", category: "Bold / Display" },

  // Vintage / Classic
  { name: "Calluna", displayName: "Calluna", category: "Vintage / Classic" },
  { name: "Carrington", displayName: "Carrington", category: "Vintage / Classic" },
  { name: "Cloister", displayName: "Cloister", category: "Vintage / Classic" },
  { name: "FertigoPro", displayName: "Fertigo Pro", category: "Vintage / Classic" },
  { name: "Fontin", displayName: "Fontin", category: "Vintage / Classic" },
  { name: "Forelle", displayName: "Forelle", category: "Vintage / Classic" },
  { name: "GoudyBookletter1911", displayName: "Goudy Bookletter 1911", category: "Vintage / Classic" },
  { name: "GoudyTwenty", displayName: "Goudy Twenty", category: "Vintage / Classic" },
  { name: "GriffosFont", displayName: "Griffos Font", category: "Vintage / Classic" },
  { name: "HillHouse", displayName: "Hill House", category: "Vintage / Classic" },
  { name: "Idolwild", displayName: "Idolwild", category: "Vintage / Classic" },

  // Edgy / Street
  { name: "BlackCasper", displayName: "Black Casper", category: "Edgy / Street" },
  { name: "BlackRose", displayName: "Black Rose", category: "Edgy / Street" },
  { name: "Broken15", displayName: "Broken15", category: "Edgy / Street" },
  { name: "BurnstownDam", displayName: "Burnstown Dam", category: "Edgy / Street" },
  { name: "GreenFuz", displayName: "Green Fuz", category: "Edgy / Street" },
  { name: "GriffinHouseSlant", displayName: "Griffin House Slant", category: "Edgy / Street" },

  // Playful / Casual
  { name: "BallparkWeiner", displayName: "Ballpark Weiner", category: "Playful / Casual" },
  { name: "ComicZine", displayName: "Comic Zine", category: "Playful / Casual" },
  { name: "Gesso", displayName: "Gesso", category: "Playful / Casual" },
  { name: "GoodDog", displayName: "Good Dog", category: "Playful / Casual" },
  { name: "HatCheck", displayName: "Hat Check", category: "Playful / Casual" },
];

export const FONT_CATEGORIES: FontCategory[] = [
  "System",
  "Clean / Sans",
  "Elegant / Script",
  "Bold / Display",
  "Vintage / Classic",
  "Edgy / Street",
  "Playful / Casual",
];

export function getFontsByCategory(category: FontCategory): FontEntry[] {
  return FONT_REGISTRY.filter((f) => f.category === category);
}

export function getFontEntry(name: string): FontEntry | undefined {
  return FONT_REGISTRY.find((f) => f.name === name);
}

const fontAssets: Record<string, any> = {};

export async function loadCustomFonts(): Promise<void> {
  try {
    const fontsToLoad: Record<string, any> = {};

    for (const entry of FONT_REGISTRY) {
      if (entry.name === "System") continue;
      const asset = fontAssets[entry.name];
      if (asset) {
        fontsToLoad[entry.name] = asset;
      }
    }

    if (Object.keys(fontsToLoad).length > 0) {
      await Font.loadAsync(fontsToLoad);
    }
  } catch (e) {
    console.warn("Font loading failed (non-fatal):", e);
  }
}

export function isFontLoaded(name: string): boolean {
  if (name === "System") return true;
  return Font.isLoaded(name);
}

export function getSafeFont(name: string): string | undefined {
  if (name === "System") return undefined;
  return isFontLoaded(name) ? name : undefined;
}
