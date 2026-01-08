/**
 * Disease Outbreak Data - 2024-2025
 *
 * Data compiled from public health sources:
 * - WHO Disease Outbreak News: https://www.who.int/emergencies/disease-outbreak-news
 * - CDC MMWR Reports: https://www.cdc.gov/mmwr/
 * - CDC Measles Data: https://www.cdc.gov/measles/data-research/
 *
 * Last updated: January 2026
 *
 * Categories follow HealthMap classification:
 * - respiratory: Influenza, MERS-CoV, respiratory infections
 * - skin_rash: Measles, Mpox, chickenpox
 * - gastrointestinal: Cholera, norovirus, foodborne illness
 * - hemorrhagic: Ebola, Marburg, dengue hemorrhagic fever
 * - vectorborne: Dengue, malaria, Zika, West Nile
 */

/**
 * Category color mapping (HealthMap-style)
 */
export const OUTBREAK_CATEGORIES = {
  respiratory: { label: "Respiratory", color: "#E53935" },      // Red
  skin_rash: { label: "Skin/Rash", color: "#D81B60" },          // Pink
  gastrointestinal: { label: "Gastrointestinal", color: "#8E24AA" }, // Purple
  hemorrhagic: { label: "Hemorrhagic Fever", color: "#C62828" }, // Dark Red
  vectorborne: { label: "Vectorborne", color: "#F57C00" },      // Orange
};

export const WHO_DISEASE_OUTBREAKS = [
  // ============================================================
  // UNITED STATES - Measles Outbreaks 2025
  // Source: CDC MMWR, https://www.cdc.gov/measles/data-research/
  // ============================================================
  {
    name: "Measles - Spartanburg, SC",
    disease: "Measles",
    category: "skin_rash",
    markerColor: "#D81B60",
    country: "United States",
    region: "Spartanburg County, South Carolina",
    cases: 214,
    deaths: 0,
    status: "Active",
    date_reported: "2025-07-09",
    headline: "SC DPH responding to measles outbreak in Upstate region",
    position: { lat: 34.9496, lng: -81.9320 }
  },
  {
    name: "Measles - Mohave County, AZ",
    disease: "Measles",
    category: "skin_rash",
    markerColor: "#D81B60",
    country: "United States",
    region: "Mohave County, Arizona",
    cases: 172,
    deaths: 0,
    status: "Active",
    date_reported: "2025-03-15",
    headline: "Arizona outbreak largely localized to Mohave County",
    position: { lat: 35.1983, lng: -114.0530 }
  },
  {
    name: "Measles - Salt Lake City, UT",
    disease: "Measles",
    category: "skin_rash",
    markerColor: "#D81B60",
    country: "United States",
    region: "Salt Lake County, Utah",
    cases: 115,
    deaths: 0,
    status: "Active",
    date_reported: "2025-04-01",
    headline: "Utah health officials confirm 115 measles cases",
    position: { lat: 40.7608, lng: -111.8910 }
  },
  {
    name: "Measles - West Texas",
    disease: "Measles",
    category: "skin_rash",
    markerColor: "#D81B60",
    country: "United States",
    region: "Gaines County, Texas",
    cases: 146,
    deaths: 2,
    status: "Active",
    date_reported: "2025-01-15",
    headline: "Largest outbreak in 30 years; two deaths confirmed",
    position: { lat: 32.7490, lng: -102.6432 }
  },
  {
    name: "Measles - Albuquerque, NM",
    disease: "Measles",
    category: "skin_rash",
    markerColor: "#D81B60",
    country: "United States",
    region: "Bernalillo County, New Mexico",
    cases: 89,
    deaths: 1,
    status: "Active",
    date_reported: "2025-02-01",
    headline: "New Mexico reports adult measles death",
    position: { lat: 35.0844, lng: -106.6504 }
  },
  {
    name: "Measles - Chicago, IL",
    disease: "Measles",
    category: "skin_rash",
    markerColor: "#D81B60",
    country: "United States",
    region: "Cook County, Illinois",
    cases: 67,
    deaths: 0,
    status: "Active",
    date_reported: "2025-03-20",
    headline: "Chicago area measles cases linked to unvaccinated communities",
    position: { lat: 41.8781, lng: -87.6298 }
  },

  // ============================================================
  // UNITED STATES - Respiratory Outbreaks
  // ============================================================
  {
    name: "H5N1 Avian Flu - Louisiana",
    disease: "Avian Influenza A(H5N1)",
    category: "respiratory",
    markerColor: "#E53935",
    country: "United States",
    region: "Louisiana",
    cases: 1,
    deaths: 1,
    status: "Active",
    date_reported: "2025-01-06",
    headline: "Louisiana confirms CDC report of child flu death",
    position: { lat: 30.9843, lng: -91.9623 }
  },
  {
    name: "H5N1 Avian Flu - California",
    disease: "Avian Influenza A(H5N1)",
    category: "respiratory",
    markerColor: "#E53935",
    country: "United States",
    region: "Central Valley, California",
    cases: 34,
    deaths: 0,
    status: "Active",
    date_reported: "2024-12-15",
    headline: "Dairy farm workers test positive for H5N1",
    position: { lat: 36.7783, lng: -119.4179 }
  },

  // ============================================================
  // GLOBAL - MERS-CoV Outbreaks (Respiratory)
  // Source: WHO DON, December 2025
  // ============================================================
  {
    name: "MERS-CoV - Riyadh",
    disease: "Middle East Respiratory Syndrome (MERS-CoV)",
    category: "respiratory",
    markerColor: "#E53935",
    country: "Saudi Arabia",
    region: "Riyadh Region",
    cases: 17,
    deaths: 4,
    status: "Active",
    date_reported: "2025-12-24",
    headline: "19 MERS cases reported to WHO globally",
    position: { lat: 24.7136, lng: 46.6753 }
  },
  {
    name: "MERS-CoV - Najran",
    disease: "Middle East Respiratory Syndrome (MERS-CoV)",
    category: "respiratory",
    markerColor: "#E53935",
    country: "Saudi Arabia",
    region: "Najran Province",
    cases: 3,
    deaths: 1,
    status: "Active",
    date_reported: "2025-12-24",
    headline: "MERS cases in southern Saudi Arabia",
    position: { lat: 17.4924, lng: 44.1277 }
  },

  // ============================================================
  // GLOBAL - Hemorrhagic Fever Outbreaks
  // Source: WHO DON
  // ============================================================
  {
    name: "Ebola - Kasai Province",
    disease: "Ebola Virus Disease",
    category: "hemorrhagic",
    markerColor: "#C62828",
    country: "Democratic Republic of the Congo",
    region: "Kasai Province, Bulape Health Zone",
    cases: 64,
    deaths: 45,
    status: "Ended",
    date_reported: "2025-09-04",
    date_ended: "2025-12-01",
    headline: "DRC's 16th Ebola outbreak declared over",
    position: { lat: -4.9167, lng: 21.7167 }
  },
  {
    name: "Marburg - Kigali",
    disease: "Marburg Virus Disease",
    category: "hemorrhagic",
    markerColor: "#C62828",
    country: "Rwanda",
    region: "Kigali",
    cases: 66,
    deaths: 15,
    status: "Ended",
    date_reported: "2024-09-27",
    date_ended: "2024-12-20",
    headline: "Rwanda's first Marburg outbreak ends",
    position: { lat: -1.9403, lng: 29.8739 }
  },
  {
    name: "Marburg - Jinka, Ethiopia",
    disease: "Marburg Virus Disease",
    category: "hemorrhagic",
    markerColor: "#C62828",
    country: "Ethiopia",
    region: "South Ethiopia Regional State",
    cases: 16,
    deaths: 11,
    status: "Active",
    date_reported: "2025-11-14",
    headline: "Ethiopia confirms Marburg outbreak",
    position: { lat: 5.7833, lng: 36.5667 }
  },
  {
    name: "Marburg - Kagera, Tanzania",
    disease: "Marburg Virus Disease",
    category: "hemorrhagic",
    markerColor: "#C62828",
    country: "Tanzania",
    region: "Kagera Region",
    cases: 10,
    deaths: 10,
    status: "Active",
    date_reported: "2025-01-16",
    headline: "Tanzania reports second Marburg outbreak",
    position: { lat: -1.5000, lng: 31.5000 }
  },

  // ============================================================
  // GLOBAL - Skin/Rash Outbreaks (Mpox)
  // Source: WHO, Africa CDC
  // ============================================================
  {
    name: "Mpox - Kinshasa",
    disease: "Mpox (Clade Ib)",
    category: "skin_rash",
    markerColor: "#D81B60",
    country: "Democratic Republic of the Congo",
    region: "Kinshasa",
    cases: 39000,
    deaths: 1000,
    status: "Active",
    date_reported: "2024-08-14",
    headline: "PHEIC declared as Mpox spreads in DRC",
    position: { lat: -4.4419, lng: 15.2663 }
  },
  {
    name: "Mpox - Bujumbura",
    disease: "Mpox (Clade Ib)",
    category: "skin_rash",
    markerColor: "#D81B60",
    country: "Burundi",
    region: "Bujumbura",
    cases: 1200,
    deaths: 15,
    status: "Active",
    date_reported: "2024-08-22",
    headline: "Mpox spreads to neighboring Burundi",
    position: { lat: -3.3822, lng: 29.3644 }
  },
  {
    name: "Mpox - Kampala",
    disease: "Mpox (Clade Ib)",
    category: "skin_rash",
    markerColor: "#D81B60",
    country: "Uganda",
    region: "Kampala",
    cases: 850,
    deaths: 8,
    status: "Active",
    date_reported: "2024-09-05",
    headline: "Uganda reports Mpox cases in capital",
    position: { lat: 0.3476, lng: 32.5825 }
  },
  {
    name: "Mpox - Nairobi",
    disease: "Mpox (Clade Ib)",
    category: "skin_rash",
    markerColor: "#D81B60",
    country: "Kenya",
    region: "Nairobi",
    cases: 320,
    deaths: 3,
    status: "Active",
    date_reported: "2024-10-12",
    headline: "Kenya confirms local Mpox transmission",
    position: { lat: -1.2921, lng: 36.8219 }
  },

  // ============================================================
  // GLOBAL - Gastrointestinal Outbreaks (Cholera)
  // Source: WHO DON, https://www.who.int/emergencies/disease-outbreak-news/item/2025-DON579
  // ============================================================
  {
    name: "Cholera - Khartoum",
    disease: "Cholera",
    category: "gastrointestinal",
    markerColor: "#8E24AA",
    country: "Sudan",
    region: "Khartoum State",
    cases: 28000,
    deaths: 840,
    status: "Active",
    date_reported: "2024-08-12",
    headline: "Cholera spreads amid ongoing conflict",
    position: { lat: 15.5007, lng: 32.5599 }
  },
  {
    name: "Cholera - Juba",
    disease: "Cholera",
    category: "gastrointestinal",
    markerColor: "#8E24AA",
    country: "South Sudan",
    region: "Central Equatoria",
    cases: 15000,
    deaths: 320,
    status: "Active",
    date_reported: "2024-10-01",
    headline: "South Sudan declares cholera emergency",
    position: { lat: 4.8594, lng: 31.5713 }
  },
  {
    name: "Cholera - N'Djamena",
    disease: "Cholera",
    category: "gastrointestinal",
    markerColor: "#8E24AA",
    country: "Chad",
    region: "N'Djamena",
    cases: 12000,
    deaths: 250,
    status: "Active",
    date_reported: "2024-09-15",
    headline: "Chad cholera outbreak expands geographically",
    position: { lat: 12.1348, lng: 15.0557 }
  },
  {
    name: "Cholera - Sana'a",
    disease: "Cholera",
    category: "gastrointestinal",
    markerColor: "#8E24AA",
    country: "Yemen",
    region: "Sana'a Governorate",
    cases: 85000,
    deaths: 1200,
    status: "Active",
    date_reported: "2024-06-01",
    headline: "Yemen cholera crisis continues amid conflict",
    position: { lat: 15.3694, lng: 44.1910 }
  },
  {
    name: "Cholera - Mogadishu",
    disease: "Cholera",
    category: "gastrointestinal",
    markerColor: "#8E24AA",
    country: "Somalia",
    region: "Banadir Region",
    cases: 22000,
    deaths: 480,
    status: "Active",
    date_reported: "2024-08-25",
    headline: "Somalia reports surge in cholera cases",
    position: { lat: 2.0469, lng: 45.3182 }
  },

  // ============================================================
  // GLOBAL - Vectorborne Outbreaks (Dengue)
  // Source: WHO, PAHO
  // ============================================================
  {
    name: "Dengue - Brasilia",
    disease: "Dengue Fever",
    category: "vectorborne",
    markerColor: "#F57C00",
    country: "Brazil",
    region: "Federal District",
    cases: 450000,
    deaths: 420,
    status: "Active",
    date_reported: "2024-02-15",
    headline: "Brazil declares health emergency for dengue",
    position: { lat: -15.7801, lng: -47.9292 }
  },
  {
    name: "Dengue - Buenos Aires",
    disease: "Dengue Fever",
    category: "vectorborne",
    markerColor: "#F57C00",
    country: "Argentina",
    region: "Buenos Aires Province",
    cases: 180000,
    deaths: 150,
    status: "Active",
    date_reported: "2024-03-01",
    headline: "Argentina reports record dengue cases",
    position: { lat: -34.6037, lng: -58.3816 }
  },
  {
    name: "Dengue - Puerto Rico",
    disease: "Dengue Fever",
    category: "vectorborne",
    markerColor: "#F57C00",
    country: "United States",
    region: "Puerto Rico",
    cases: 9800,
    deaths: 12,
    status: "Active",
    date_reported: "2024-08-01",
    headline: "Puerto Rico declares public health emergency",
    position: { lat: 18.2208, lng: -66.5901 }
  },

  // ============================================================
  // Additional Respiratory (H5N1 Global)
  // ============================================================
  {
    name: "H5N1 Avian Flu - Cambodia",
    disease: "Avian Influenza A(H5N1)",
    category: "respiratory",
    markerColor: "#E53935",
    country: "Cambodia",
    region: "Prey Veng Province",
    cases: 4,
    deaths: 2,
    status: "Active",
    date_reported: "2024-11-20",
    headline: "Cambodia reports human H5N1 infections",
    position: { lat: 11.4841, lng: 105.3236 }
  }
];

/**
 * Marker fields to display in info popup
 */
export const WHO_OUTBREAK_FIELDS = [
  "disease",
  "category",
  "country",
  "region",
  "cases",
  "deaths",
  "status",
  "date_reported",
  "headline"
];

/**
 * Get outbreaks filtered by category
 */
export function getOutbreaksByCategory(category) {
  return WHO_DISEASE_OUTBREAKS.filter(o => o.category === category);
}

/**
 * Get outbreak counts by category
 */
export function getOutbreakCounts() {
  const counts = {};
  for (const cat of Object.keys(OUTBREAK_CATEGORIES)) {
    counts[cat] = WHO_DISEASE_OUTBREAKS.filter(o => o.category === cat).length;
  }
  return counts;
}
