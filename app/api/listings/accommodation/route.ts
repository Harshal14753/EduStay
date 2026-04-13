
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const university = searchParams.get('university');
    const minRent = searchParams.get('minRent');
    const maxRent = searchParams.get('maxRent');
    const roomType = searchParams.get('roomType');
    const accommodationType = searchParams.get('accommodationType');
    const amenities = searchParams.get('amenities');

    let whereCondition: any = {
      availability: true
    };

    if (university) {
      whereCondition.nearbyUniversities = {
        has: university
      };
    }

    if (minRent || maxRent) {
      whereCondition.OR = [
        {
          // For daily rate listings
          dailyRate: {
            gte: minRent ? parseInt(minRent) / 30 : undefined,
            lte: maxRent ? parseInt(maxRent) / 30 : undefined
          }
        },
        {
          // For monthly rate listings
          monthlyRent: {
            gte: minRent ? parseInt(minRent) : undefined,
            lte: maxRent ? parseInt(maxRent) : undefined
          }
        }
      ];
    }

    if (roomType && roomType !== 'all') {
      whereCondition.roomType = roomType;
    }

    if (accommodationType && accommodationType !== 'all') {
      whereCondition.accommodationType = accommodationType;
    }

    if (amenities) {
      const amenityList = amenities.split(',');
      whereCondition.amenities = {
        hasEvery: amenityList
      };
    }

    const accommodations = await prisma.accommodationListing.findMany({
      where: whereCondition,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ accommodations });
  } catch (error) {
    console.error("Error fetching accommodations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userType = (session.user as any)?.userType;
    if (userType !== 'PROPERTY_OWNER') {
      return NextResponse.json(
        { error: "Only property owners can create listings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      propertyName,
      photos,
      dailyRate,
      monthlyRent,
      minStay,
      deposit,
      amenities,
      roomType,
      accommodationType,
      livingPreferences,
      foodPreference,
      address,
      latitude,
      longitude,
      contactInfo,
      description,
      nearbyUniversities,
      distanceFromUni
    } = body;

    const parsedMonthlyRent = Number(monthlyRent);
    const parsedDailyRate = Number(dailyRate);
    const resolvedDailyRate = Number.isFinite(parsedDailyRate) && parsedDailyRate > 0
      ? Math.floor(parsedDailyRate)
      : (Number.isFinite(parsedMonthlyRent) && parsedMonthlyRent > 0
          ? Math.max(1, Math.floor(parsedMonthlyRent / 30))
          : NaN);

    if (!Number.isFinite(resolvedDailyRate) || resolvedDailyRate <= 0) {
      return NextResponse.json(
        { error: "Valid rent is required. Please provide monthly rent or daily rate." },
        { status: 400 }
      );
    }

    const resolvedMonthlyRent = Number.isFinite(parsedMonthlyRent) && parsedMonthlyRent > 0
      ? Math.floor(parsedMonthlyRent)
      : resolvedDailyRate * 30;

    const parsedMinStay = Number(minStay);
    const resolvedMinStay = Number.isFinite(parsedMinStay) && parsedMinStay > 0 ? Math.floor(parsedMinStay) : 1;

    const accommodation = await prisma.accommodationListing.create({
      data: {
        propertyName,
        photos: photos || [],
        dailyRate: resolvedDailyRate,
        monthlyRent: resolvedMonthlyRent,
        minStay: resolvedMinStay,
        deposit: deposit ? parseInt(deposit) : null,
        amenities: amenities || [],
        roomType,
        accommodationType,
        livingPreferences: livingPreferences || [],
        foodPreference,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        contactInfo,
        description,
        nearbyUniversities: nearbyUniversities || [],
        distanceFromUni: distanceFromUni ? parseFloat(distanceFromUni) : null,
        ownerId: (session.user as any).id
      }
    });

    return NextResponse.json(
      { accommodation, message: "Accommodation listing created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating accommodation listing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
