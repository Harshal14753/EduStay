// app/api/chatbot/route.ts
// Smart location-aware chatbot — queries DB for nearby accommodation & food listings

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Intent = "accommodation" | "food" | "both";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Words to ignore when doing keyword matching */
const STOP_WORDS = new Set([
  "i", "am", "is", "in", "at", "a", "an", "the", "for", "near", "around",
  "looking", "find", "want", "need", "show", "get", "help", "me", "my",
  "please", "stay", "search", "place", "places", "any", "some", "good",
  "best", "cheap", "affordable", "please", "can", "you", "pg", "hostel",
  "room", "flat", "food", "mess", "tiffin", "accommodation",
]);

function meaningfulWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/** Fuzzy-match a university name against user words */
function universityMatches(uniName: string, msgLow: string, words: string[]): boolean {
  const uLow = uniName.toLowerCase();
  // Full phrase match
  if (msgLow.includes(uLow)) return true;
  // Any word of the uni name found in user words
  const uWords = uLow.split(/\s+/).filter((w) => w.length > 2);
  return uWords.some((uw) => words.includes(uw) || words.some((mw) => mw.includes(uw)));
}

// ─── Price / type formatters ──────────────────────────────────────────────────

function formatAccommodation(a: any, idx: number): string {
  const typeLine = `${a.accommodationType} • ${a.roomType} Room`;
  const unis = a.nearbyUniversities?.length
    ? `🎓 Near: ${(a.nearbyUniversities as string[]).join(", ")}`
    : "";
  const amenities = (a.amenities as string[]).slice(0, 4).join(", ");
  return [
    `${idx}. *${a.propertyName}*`,
    `   💰 ₹${a.monthlyRent.toLocaleString("en-IN")}/month  |  ${typeLine}`,
    unis ? `   ${unis}` : "",
    `   📍 ${a.address}`,
    `   📞 ${a.contactInfo}`,
    amenities ? `   ✅ ${amenities}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatFood(f: any, idx: number): string {
  const type = (f.serviceType as string).replace(/_/g, " ");
  const dietary: string[] = [];
  if (f.vegOptions) dietary.push("Veg");
  if (f.nonVegOptions) dietary.push("Non-Veg");

  return [
    `${idx}. *${f.serviceName}*`,
    `   💲 ${f.priceRange}  |  🍽️ ${type}`,
    dietary.length ? `   🥗 ${dietary.join(" & ")}` : "",
    f.operatingHours ? `   ⏰ ${f.operatingHours}` : "",
    `   📍 ${f.address}`,
    `   📞 ${f.contactInfo}`,
    f.deliveryAvailable ? "   🛵 Delivery Available" : "",
  ]
    .filter(Boolean)
    .join("\n");
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let message: string;
  let intent: Intent;

  try {
    const body = await req.json();
    message = (body?.message ?? "").trim();
    intent = (body?.intent as Intent) ?? "both";
  } catch {
    return NextResponse.json(
      { ok: false, reply: "⚠️ Invalid request body." },
      { status: 400 }
    );
  }

  if (!message) {
    return NextResponse.json(
      { ok: false, reply: "⚠️ Please enter a location or university name." },
      { status: 400 }
    );
  }

  try {
    const msgLow = message.toLowerCase();
    const words = meaningfulWords(message);

    // ── 1. Resolve university names that match the user's input ──────────────
    const allUniversities = await prisma.university.findMany({
      select: { name: true, city: true },
    });

    const matchedUniNames = allUniversities
      .filter((u) => universityMatches(u.name, msgLow, words))
      .map((u) => u.name);

    // ── 2. Build DB OR conditions ────────────────────────────────────────────
    // Always try: address contains the whole phrase
    const addressOR: any[] = [
      { address: { contains: message, mode: "insensitive" } },
    ];
    // Also try each meaningful word individually
    for (const w of words) {
      addressOR.push({ address: { contains: w, mode: "insensitive" } });
    }

    // ── 3. Query DB ──────────────────────────────────────────────────────────
    let accommodations: any[] = [];
    let foodServices: any[] = [];

    if (intent === "accommodation" || intent === "both") {
      const where: any = {
        availability: true,
        OR: [
          ...addressOR,
          ...(matchedUniNames.length > 0
            ? [{ nearbyUniversities: { hasSome: matchedUniNames } }]
            : []),
        ],
      };
      accommodations = await prisma.accommodationListing.findMany({
        where,
        select: {
          id: true,
          propertyName: true,
          monthlyRent: true,
          roomType: true,
          accommodationType: true,
          address: true,
          amenities: true,
          contactInfo: true,
          nearbyUniversities: true,
          description: true,
          photos: true,
        },
        take: 5,
        orderBy: { monthlyRent: "asc" },
      });
    }

    if (intent === "food" || intent === "both") {
      foodServices = await prisma.foodServiceListing.findMany({
        where: { OR: addressOR },
        select: {
          id: true,
          serviceName: true,
          serviceType: true,
          priceRange: true,
          address: true,
          cuisineType: true,
          vegOptions: true,
          nonVegOptions: true,
          contactInfo: true,
          operatingHours: true,
          deliveryAvailable: true,
          description: true,
          photos: true,
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      });
    }

    const total = accommodations.length + foodServices.length;

    // ── 4. Format reply ──────────────────────────────────────────────────────
    if (total === 0) {
      const examples =
        allUniversities
          .slice(0, 4)
          .map((u) => u.name)
          .join(", ");
      const reply = [
        `😔 No listings found near "${message}".`,
        "",
        "Try searching with:",
        "• University name — e.g., IIT Bombay, AIIMS Delhi",
        "• City name — e.g., Mumbai, Delhi, Chandigarh, Chennai",
        "• Area name — e.g., Powai, Karol Bagh, Manipal",
        "",
        `Available universities: ${examples}`,
      ].join("\n");

      return NextResponse.json({
        ok: true,
        reply,
        accommodations: [],
        foodServices: [],
        count: 0,
      });
    }

    const sections: string[] = [];

    if (accommodations.length > 0) {
      sections.push(`🏠 Accommodation (${accommodations.length} found)\n${"─".repeat(28)}`);
      sections.push(accommodations.map((a, i) => formatAccommodation(a, i + 1)).join("\n\n"));
    }

    if (foodServices.length > 0) {
      sections.push(`\n🍱 Food Services (${foodServices.length} found)\n${"─".repeat(28)}`);
      sections.push(foodServices.map((f, i) => formatFood(f, i + 1)).join("\n\n"));
    }

    const reply =
      `Found ${total} listing${total > 1 ? "s" : ""} near "${message}":\n\n` +
      sections.join("\n");

    return NextResponse.json({
      ok: true,
      reply,
      accommodations,
      foodServices,
      count: total,
    });
  } catch (e: any) {
    console.error("Chatbot DB error:", e);
    return NextResponse.json(
      {
        ok: false,
        reply:
          "⚠️ Could not connect to database.\n\nMake sure your DATABASE_URL in .env is set correctly and the database is running.",
      },
      { status: 500 }
    );
  }
}
