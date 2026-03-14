// ─── Identifiers ─────────────────────────────────────────────────────────────

export type ItemId = string;

// ─── Items ────────────────────────────────────────────────────────────────────

export type ItemCategory =
  | "raw"           // Extracted directly: Iron Ore, Carbon, Nitrogen, …
  | "intermediate"  // Produced by factories: Steel Bar, Polymer Bar, …
  | "advanced"      // High-tier intermediates: Superconductor, Nano Composite, …
  | "building"      // Produced by Assembly Plant for placement: Extractor, Factory, …
  | "vehicle"       // Produced by Assembly Plant: Train, Container Ship, …
  | "agricultural"  // Compost, Seeds, Food, Trees, …
  | "gas";          // Terraforming gases: SF6, NF3, …

export interface Item {
  id: ItemId;
  name: string;
  category: ItemCategory;
  /** True for items with no recipe (extracted resources); terminates graph traversal */
  raw: boolean;
}

// ─── Buildings ───────────────────────────────────────────────────────────────

export type BuildingType =
  | "extractor"             // Placed on mineral deposits; extracts raw resources
  | "atmospheric_extractor" // Extracts atmospheric gases: Carbon, Oxygen, Nitrogen
  | "factory"               // Primary transformation; 2 inputs → 1 output, 30 batches/yr
  | "assembly_plant"        // Produces buildings & vehicles; 2 inputs, 10 batches/yr
  | "recycling_center"      // Processes waste into usable materials; 30 batches/yr
  | "greenhouse";           // Agricultural production; longer cycle times

// ─── Recipes ─────────────────────────────────────────────────────────────────

export interface RecipeIngredient {
  itemId: ItemId;
  quantity: number;
}

export interface Recipe {
  id: string;
  building: BuildingType;
  inputs: RecipeIngredient[];
  outputs: RecipeIngredient[];
  /** Duration of one production batch, in in-game days */
  durationDays: number;
  /** Batches completed per in-game year (= 360 / durationDays) */
  batchesPerYear: number;
}

// ─── Calculator output ────────────────────────────────────────────────────────

export interface BuildRequirement {
  building: BuildingType;
  recipe: Recipe;
  /**
   * Number of buildings required to meet the target output.
   * Fractional — the UI can ceil() this for a "safe" count.
   */
  count: number;
  /** Target output per year that this requirement satisfies */
  outputPerYear: number;
}
