import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const listing = await prisma.accommodationListing.findUnique({
      where: { id: params.id }
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.ownerId !== (session.user as any).id) {
      return NextResponse.json({ error: "You can only access your own listings" }, { status: 403 });
    }

    return NextResponse.json({ accommodation: listing });
  } catch (error) {
    console.error("Error fetching accommodation listing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userType = (session.user as any)?.userType;
    if (userType !== "PROPERTY_OWNER") {
      return NextResponse.json({ error: "Only property owners can update listings" }, { status: 403 });
    }

    const listing = await prisma.accommodationListing.findUnique({ where: { id: params.id } });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.ownerId !== (session.user as any).id) {
      return NextResponse.json({ error: "You can only update your own listings" }, { status: 403 });
    }

    const body = await request.json();
    const parsedMonthlyRent = body.monthlyRent !== undefined ? Number(body.monthlyRent) : listing.monthlyRent;
    if (!Number.isFinite(parsedMonthlyRent) || parsedMonthlyRent <= 0) {
      return NextResponse.json({ error: "Valid monthly rent is required" }, { status: 400 });
    }

    const parsedMinStay = body.minStay !== undefined ? Number(body.minStay) : listing.minStay;
    if (!Number.isFinite(parsedMinStay) || parsedMinStay <= 0) {
      return NextResponse.json({ error: "Valid minimum stay is required" }, { status: 400 });
    }

    const depositValue = body.deposit === ""
      ? null
      : body.deposit !== undefined
        ? (body.deposit === null ? null : Number(body.deposit))
        : listing.deposit;

    if (depositValue !== null && !Number.isFinite(depositValue)) {
      return NextResponse.json({ error: "Invalid deposit value" }, { status: 400 });
    }

    const latitudeValue = body.latitude !== undefined
      ? (body.latitude === null || body.latitude === "" ? null : Number(body.latitude))
      : listing.latitude;
    const longitudeValue = body.longitude !== undefined
      ? (body.longitude === null || body.longitude === "" ? null : Number(body.longitude))
      : listing.longitude;
    const distanceFromUniValue = body.distanceFromUni !== undefined
      ? (body.distanceFromUni === null || body.distanceFromUni === "" ? null : Number(body.distanceFromUni))
      : listing.distanceFromUni;

    if (latitudeValue !== null && !Number.isFinite(latitudeValue)) {
      return NextResponse.json({ error: "Invalid latitude value" }, { status: 400 });
    }
    if (longitudeValue !== null && !Number.isFinite(longitudeValue)) {
      return NextResponse.json({ error: "Invalid longitude value" }, { status: 400 });
    }
    if (distanceFromUniValue !== null && !Number.isFinite(distanceFromUniValue)) {
      return NextResponse.json({ error: "Invalid distance value" }, { status: 400 });
    }

    const updatedListing = await prisma.accommodationListing.update({
      where: { id: params.id },
      data: {
        propertyName: body.propertyName ?? listing.propertyName,
        photos: Array.isArray(body.photos) ? body.photos : listing.photos,
        dailyRate: Math.max(1, Math.floor(parsedMonthlyRent / 30)),
        monthlyRent: Math.floor(parsedMonthlyRent),
        minStay: Math.floor(parsedMinStay),
        deposit: depositValue === null ? null : Math.floor(depositValue),
        amenities: Array.isArray(body.amenities) ? body.amenities : listing.amenities,
        roomType: body.roomType ?? listing.roomType,
        accommodationType: body.accommodationType ?? listing.accommodationType,
        livingPreferences: Array.isArray(body.livingPreferences) ? body.livingPreferences : listing.livingPreferences,
        foodPreference: body.foodPreference ?? listing.foodPreference,
        address: body.address ?? listing.address,
        latitude: latitudeValue,
        longitude: longitudeValue,
        contactInfo: body.contactInfo ?? listing.contactInfo,
        description: body.description ?? listing.description,
        nearbyUniversities: Array.isArray(body.nearbyUniversities) ? body.nearbyUniversities : listing.nearbyUniversities,
        distanceFromUni: distanceFromUniValue,
        availability: body.availability !== undefined ? Boolean(body.availability) : listing.availability,
      }
    });

    return NextResponse.json({
      accommodation: updatedListing,
      message: "Listing updated successfully"
    });
  } catch (error) {
    console.error("Error updating accommodation listing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userType = (session.user as any)?.userType;
    if (userType !== "PROPERTY_OWNER") {
      return NextResponse.json({ error: "Only property owners can delete listings" }, { status: 403 });
    }

    const listing = await prisma.accommodationListing.findUnique({
      where: { id: params.id },
      select: { ownerId: true }
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.ownerId !== (session.user as any).id) {
      return NextResponse.json({ error: "You can only delete your own listings" }, { status: 403 });
    }

    await prisma.accommodationListing.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting accommodation listing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
