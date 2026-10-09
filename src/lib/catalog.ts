export const CONCERNS = [
  {
    slug: "pigmentation",
    name: "Pigmentation & tanning",
    line: "Marks, melasma-prone tone and sun-deepened colour",
    copy: "Indian skin tans quickly and marks linger. These formulas use named brightening actives at stated strengths, alongside daily sun protection.",
  },
  {
    slug: "acne",
    name: "Acne & breakouts",
    line: "Oil, congestion and post-acne marks",
    copy: "Humidity and congestion show up as breakouts and marks. These formulas clarify without stripping the barrier that humid weather already stresses.",
  },
  {
    slug: "barrier",
    name: "Sensitivity & barrier",
    line: "Hard water, over-exfoliation and reactive skin",
    copy: "Hard water, fragrance and too many actives at once leave skin tight and reactive. Barrier care comes before stronger treatments.",
  },
  {
    slug: "ageing",
    name: "Premature ageing",
    line: "Early lines from sun, pollution and late SPF",
    copy: "Most early lines on Indian skin are sun and pollution, not a missing 10-step routine. Retinoids at night, sunscreen every morning.",
  },
  {
    slug: "sun",
    name: "Sun protection",
    line: "Daily UV, humidity and no white cast",
    copy: "A sunscreen that pills or casts grey on deeper skin tones does not get worn. This fluid is built to be used every morning.",
  },
  {
    slug: "dehydration",
    name: "Dehydration",
    line: "Heat outside, air-conditioning inside",
    copy: "Skin can be oily and dehydrated in the same day. Humectants help it hold water without a heavy occlusive film.",
  },
] as const;

export const CATEGORIES = [
  { slug: "cleanser", name: "Cleansers" },
  { slug: "serum", name: "Serums" },
  { slug: "moisturiser", name: "Moisturisers" },
  { slug: "sunscreen", name: "Sunscreen" },
  { slug: "treatment", name: "Treatments" },
] as const;

export const SKIN_TYPES = ["Oily", "Dry", "Combination", "Sensitive", "Normal"] as const;

export const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Other",
] as const;

export function concernBySlug(slug: string) {
  return CONCERNS.find((item) => item.slug === slug) ?? null;
}

export function categoryName(slug: string) {
  return CATEGORIES.find((item) => item.slug === slug)?.name ?? slug;
}
