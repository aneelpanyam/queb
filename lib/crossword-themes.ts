export const CROSSWORD_THEMES = [
  {
    name: "Geography & Landscape",
    description: "Natural features, terrain, climate, bodies of water, and geographic landmarks that define the place",
  },
  {
    name: "History & Heritage",
    description: "Historical events, famous figures, founding stories, monuments, and milestones associated with the place",
  },
  {
    name: "Wildlife & Nature",
    description: "Animals, plants, ecosystems, national parks, and natural wonders found in or near the place",
  },
  {
    name: "Culture & Traditions",
    description: "Local customs, festivals, art, music, languages, and cultural practices unique to the place",
  },
  {
    name: "Famous Landmarks",
    description: "Iconic buildings, structures, statues, museums, and must-see attractions that define the place",
  },
  {
    name: "Local Food & Cuisine",
    description: "Traditional dishes, ingredients, food markets, culinary traditions, and famous restaurants or food experiences",
  },
  {
    name: "Fun Facts & Trivia",
    description: "Surprising, entertaining, and little-known facts that make the place special and memorable for young visitors",
  },
] as const

export type CrosswordTheme = (typeof CROSSWORD_THEMES)[number]
