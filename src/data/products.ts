export type Category = "Dresses" | "Tops" | "Pants" | "Outerwear";
export type Material = "Linen" | "Silk" | "Cotton" | "Hemp" | "TENCEL";

export interface Product {
  id: number;
  name: string;
  brand: string;
  materialLabel: string;
  category: Category;
  material: Material;
  price: number;
  breathabilityScore: number;
  cleanScore: number;
  fairPriceRange: string;
  designHonestyNote: string;
  buyUrl: string;
  swatchFrom: string;
  swatchTo: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Wrap Dress",
    brand: "Beira",
    materialLabel: "100% Linen",
    category: "Dresses",
    material: "Linen",
    price: 145,
    breathabilityScore: 9,
    cleanScore: 8,
    fairPriceRange: "$120–$160",
    designHonestyNote:
      "A timeless wrap silhouette that fits multiple body types without size multiplicity. The adjustable tie eliminates fit guesswork — no vanity sizing, just honest cut.",
    buyUrl: "https://rhenoy.com",
    swatchFrom: "#E8C8BE",
    swatchTo: "#F7F4EE",
  },
  {
    id: 2,
    name: "Midi Dress",
    brand: "Sawa",
    materialLabel: "Peace Silk",
    category: "Dresses",
    material: "Silk",
    price: 285,
    breathabilityScore: 7,
    cleanScore: 7,
    fairPriceRange: "$260–$310",
    designHonestyNote:
      "Woven from peace silk — no silkworms harmed in production. The price reflects hand-finishing in a certified fair-wage atelier in Jaipur. Designed to be worn for decades.",
    buyUrl: "https://rhenoy.com",
    swatchFrom: "#d4c5b8",
    swatchTo: "#e8d8cc",
  },
  {
    id: 3,
    name: "Canvas Sundress",
    brand: "Kaiku",
    materialLabel: "100% Hemp",
    category: "Dresses",
    material: "Hemp",
    price: 125,
    breathabilityScore: 8,
    cleanScore: 9,
    fairPriceRange: "$100–$140",
    designHonestyNote:
      "Hemp requires no pesticides and regenerates soil. This easy drop-hem cut works from beach to city without pretending to be something it isn't.",
    buyUrl: "https://rhenoy.com",
    swatchFrom: "#c5d4c2",
    swatchTo: "#F7F4EE",
  },
  {
    id: 4,
    name: "Oversized Shirt",
    brand: "Lore",
    materialLabel: "TENCEL™ Lyocell",
    category: "Tops",
    material: "TENCEL",
    price: 85,
    breathabilityScore: 7,
    cleanScore: 9,
    fairPriceRange: "$70–$95",
    designHonestyNote:
      "TENCEL Lyocell is produced in a closed-loop process — 99% of solvent is recovered and reused. This shirt is cut oversize intentionally: it layers, it tucks, it drapes.",
    buyUrl: "https://rhenoy.com",
    swatchFrom: "#8FA68A",
    swatchTo: "#c5d4c2",
  },
  {
    id: 5,
    name: "Boxy Crop",
    brand: "Hana",
    materialLabel: "Organic Cotton",
    category: "Tops",
    material: "Cotton",
    price: 65,
    breathabilityScore: 8,
    cleanScore: 6,
    fairPriceRange: "$55–$75",
    designHonestyNote:
      "GOTS-certified organic cotton grown without synthetic pesticides. Cropped at a length that works with high-waisted everything.",
    buyUrl: "https://rhenoy.com",
    swatchFrom: "#F7F4EE",
    swatchTo: "#E8C8BE",
  },
  {
    id: 6,
    name: "Gathered Blouse",
    brand: "Beira",
    materialLabel: "100% Linen",
    category: "Tops",
    material: "Linen",
    price: 95,
    breathabilityScore: 9,
    cleanScore: 8,
    fairPriceRange: "$80–$110",
    designHonestyNote:
      "European linen, naturally dyed with plant extracts. The gathering at cuffs and neck is the only embellishment — no unnecessary hardware, no trend chasing.",
    buyUrl: "https://rhenoy.com",
    swatchFrom: "#E8C8BE",
    swatchTo: "#c5d4c2",
  },
  {
    id: 7,
    name: "Wide Leg Pant",
    brand: "Kaiku",
    materialLabel: "100% Hemp",
    category: "Pants",
    material: "Hemp",
    price: 135,
    breathabilityScore: 8,
    cleanScore: 9,
    fairPriceRange: "$115–$155",
    designHonestyNote:
      "Wide leg is not a trend here — it's a shape that has existed for centuries for good reason. Elasticated waistband. Hemp softens beautifully with every wash.",
    buyUrl: "https://rhenoy.com",
    swatchFrom: "#2C2B27",
    swatchTo: "#5a5950",
  },
  {
    id: 8,
    name: "Tailored Trouser",
    brand: "Lore",
    materialLabel: "TENCEL™ Lyocell",
    category: "Pants",
    material: "TENCEL",
    price: 145,
    breathabilityScore: 7,
    cleanScore: 9,
    fairPriceRange: "$125–$165",
    designHonestyNote:
      "A straight leg that reads as tailored without stiffness. TENCEL's natural drape does the work conventional polyester blends need interfacing for.",
    buyUrl: "https://rhenoy.com",
    swatchFrom: "#c5d4c2",
    swatchTo: "#8FA68A",
  },
  {
    id: 9,
    name: "Palazzo Pant",
    brand: "Sawa",
    materialLabel: "Peace Silk",
    category: "Pants",
    material: "Silk",
    price: 195,
    breathabilityScore: 7,
    cleanScore: 7,
    fairPriceRange: "$175–$215",
    designHonestyNote:
      "Palazzo proportions that move like water. Made from deadstock peace silk — sourced from mill overruns to prevent textile waste before it starts.",
    buyUrl: "https://rhenoy.com",
    swatchFrom: "#E8C8BE",
    swatchTo: "#d4c5b8",
  },
  {
    id: 10,
    name: "Duster Coat",
    brand: "Beira",
    materialLabel: "100% Linen",
    category: "Outerwear",
    material: "Linen",
    price: 245,
    breathabilityScore: 9,
    cleanScore: 8,
    fairPriceRange: "$220–$270",
    designHonestyNote:
      "Long, open-front, unlined — a coat that trusts the fabric to do its job. Linen's natural temperature regulation makes it useful across three seasons.",
    buyUrl: "https://rhenoy.com",
    swatchFrom: "#F7F4EE",
    swatchTo: "#E8C8BE",
  },
  {
    id: 11,
    name: "Field Jacket",
    brand: "Hana",
    materialLabel: "Organic Cotton",
    category: "Outerwear",
    material: "Cotton",
    price: 185,
    breathabilityScore: 8,
    cleanScore: 7,
    fairPriceRange: "$165–$205",
    designHonestyNote:
      "Four pockets, metal snaps, no polyester fill. A utility jacket built for actual utility. GOTS-certified cotton canvas that gets better with age and use.",
    buyUrl: "https://rhenoy.com",
    swatchFrom: "#8FA68A",
    swatchTo: "#2C2B27",
  },
  {
    id: 12,
    name: "Cocoon Coat",
    brand: "Kaiku",
    materialLabel: "100% Hemp",
    category: "Outerwear",
    material: "Hemp",
    price: 265,
    breathabilityScore: 7,
    cleanScore: 9,
    fairPriceRange: "$240–$290",
    designHonestyNote:
      "A substantial coat made from heavyweight hemp canvas — naturally water-resistant without chemical treatment. Cocoon cut: generous, sculptural, and honest about its volume.",
    buyUrl: "https://rhenoy.com",
    swatchFrom: "#2C2B27",
    swatchTo: "#8FA68A",
  },
];

export const CATEGORIES: Category[] = ["Dresses", "Tops", "Pants", "Outerwear"];
export const MATERIALS: Material[] = ["Linen", "Silk", "Cotton", "Hemp", "TENCEL"];
