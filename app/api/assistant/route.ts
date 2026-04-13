// app/api/assistant/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Ensure Node runtime for Prisma
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Prisma singleton to avoid hot-reload connection leaks in dev
const prisma =
  (globalThis as any).__prisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (!(globalThis as any).__prisma__) (globalThis as any).__prisma__ = prisma;

// --- super small "planner" you can replace with LLaMA later
function toStructuredQuery(text: string) {
  const t = (text || "").toLowerCase();

  const isFood = /\b(mess|canteen|tiffin|food|cafe|restaurant)\b/.test(t);
  const kind: "accommodation" | "food" = isFood ? "food" : "accommodation";

  const uni = t.match(/\b(iit|iiit|nit|university|college)[\w\s\-]*/i)?.[0]?.trim();
  const maxRent = /(?:under|below|<=|less than)\s*₹?\s*([0-9]{3,6})/.exec(t)?.[1];

  const where: any = {};
  if (uni) where.nearbyUniversities = { has: uni };
  if (maxRent && kind === "accommodation") where.monthlyRent = { lte: Number(maxRent) };
  if (/\bwifi\b/.test(t)) (where.amenities = where.amenities ?? { hasEvery: [] }).hasEvery.push("wifi");
  if (/\bac\b/.test(t)) (where.amenities = where.amenities ?? { hasEvery: [] }).hasEvery.push("ac");

  return { kind, where };
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    const plan = toStructuredQuery(message);

    let results: any[] = [];
    if (plan.kind === "accommodation") {
      results = await prisma.accommodationListing.findMany({
        where: plan.where,
        take: 20,
        orderBy: { monthlyRent: "asc" },
      });
    } else {
      results = await prisma.foodServiceListing.findMany({
        where: plan.where,
        take: 20,
        orderBy: { priceRange: "asc" },
      });
    }

    // Simple formatter; swap with LLaMA formatter later
    let reply = "I couldn’t find matches. Try widening distance or removing filters.";
    if (results.length) {
      const lines = results.slice(0, 5).map((r: any) => {
        const name = r.propertyName ?? r.serviceName ?? "Listing";
        const price = r.monthlyRent ? `₹${r.monthlyRent}/mo` : r.priceRange ?? "";
        const dist = r.distanceFromUni ? ` • ${r.distanceFromUni.toFixed(1)} km` : "";
        return `• ${name}${price ? " — " + price : ""}${dist}`;
      });
      reply = `Here are some matches:\n${lines.join("\n")}`;
    }

    return NextResponse.json({
      ok: true,
      reply,            // <-- this matches Chatbot.tsx
      count: results.length,
      plan,             // optional, keep if you want debug info
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, reply: "⚠️ Server error.", error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}


