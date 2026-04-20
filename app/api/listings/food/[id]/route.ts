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

    const listing = await prisma.foodServiceListing.findUnique({
      where: { id: params.id }
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.ownerId !== (session.user as any).id) {
      return NextResponse.json({ error: "You can only access your own listings" }, { status: 403 });
    }

    return NextResponse.json({ foodService: listing });
  } catch (error) {
    console.error("Error fetching food listing:", error);
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

    const listing = await prisma.foodServiceListing.findUnique({ where: { id: params.id } });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.ownerId !== (session.user as any).id) {
      return NextResponse.json({ error: "You can only update your own listings" }, { status: 403 });
    }

    const body = await request.json();
    const serviceType = body.serviceType ?? listing.serviceType;
    const priceRange = body.priceRange ?? listing.priceRange;

    const validServiceTypes = ["MESS", "CANTEEN", "TIFFIN_SERVICE", "RESTAURANT", "CAFE"];
    const validPriceRanges = ["BUDGET", "MODERATE", "PREMIUM"];
    if (!validServiceTypes.includes(serviceType)) {
      return NextResponse.json({ error: "Invalid service type" }, { status: 400 });
    }
    if (!validPriceRanges.includes(priceRange)) {
      return NextResponse.json({ error: "Invalid price range" }, { status: 400 });
    }

    const latitudeValue = body.latitude !== undefined
      ? (body.latitude === null || body.latitude === "" ? null : Number(body.latitude))
      : listing.latitude;
    const longitudeValue = body.longitude !== undefined
      ? (body.longitude === null || body.longitude === "" ? null : Number(body.longitude))
      : listing.longitude;

    if (latitudeValue !== null && !Number.isFinite(latitudeValue)) {
      return NextResponse.json({ error: "Invalid latitude value" }, { status: 400 });
    }
    if (longitudeValue !== null && !Number.isFinite(longitudeValue)) {
      return NextResponse.json({ error: "Invalid longitude value" }, { status: 400 });
    }

    const updatedListing = await prisma.foodServiceListing.update({
      where: { id: params.id },
      data: {
        serviceName: body.serviceName ?? listing.serviceName,
        photos: Array.isArray(body.photos) ? body.photos : listing.photos,
        serviceType,
        priceRange,
        menuDetails: body.menuDetails !== undefined ? body.menuDetails : listing.menuDetails,
        cuisineType: Array.isArray(body.cuisineType) ? body.cuisineType : listing.cuisineType,
        vegOptions: body.vegOptions !== undefined ? Boolean(body.vegOptions) : listing.vegOptions,
        nonVegOptions: body.nonVegOptions !== undefined ? Boolean(body.nonVegOptions) : listing.nonVegOptions,
        address: body.address ?? listing.address,
        latitude: latitudeValue,
        longitude: longitudeValue,
        contactInfo: body.contactInfo ?? listing.contactInfo,
        description: body.description !== undefined ? body.description : listing.description,
        operatingHours: body.operatingHours !== undefined ? body.operatingHours : listing.operatingHours,
        deliveryAvailable: body.deliveryAvailable !== undefined ? Boolean(body.deliveryAvailable) : listing.deliveryAvailable,
      }
    });

    return NextResponse.json({
      foodService: updatedListing,
      message: "Listing updated successfully"
    });
  } catch (error) {
    console.error("Error updating food listing:", error);
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

    const listing = await prisma.foodServiceListing.findUnique({
      where: { id: params.id },
      select: { ownerId: true }
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.ownerId !== (session.user as any).id) {
      return NextResponse.json({ error: "You can only delete your own listings" }, { status: 403 });
    }

    await prisma.foodServiceListing.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting food listing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
