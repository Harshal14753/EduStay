
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get('serviceType');
    const priceRange = searchParams.get('priceRange');
    const cuisineType = searchParams.get('cuisineType');
    const vegOptions = searchParams.get('vegOptions');
    const deliveryAvailable = searchParams.get('deliveryAvailable');

    let whereCondition: any = {};

    if (serviceType && serviceType !== 'all') {
      whereCondition.serviceType = serviceType;
    }

    if (priceRange && priceRange !== 'all') {
      whereCondition.priceRange = priceRange;
    }

    if (cuisineType) {
      const cuisineList = cuisineType.split(',');
      whereCondition.cuisineType = {
        hasEvery: cuisineList
      };
    }

    if (vegOptions === 'true') {
      whereCondition.vegOptions = true;
    }

    if (deliveryAvailable === 'true') {
      whereCondition.deliveryAvailable = true;
    }

    const foodServices = await prisma.foodServiceListing.findMany({
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

    return NextResponse.json({ foodServices });
  } catch (error) {
    console.error("Error fetching food services:", error);
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
      serviceName,
      photos,
      serviceType,
      priceRange,
      menuDetails,
      cuisineType,
      vegOptions,
      nonVegOptions,
      address,
      latitude,
      longitude,
      contactInfo,
      description,
      operatingHours,
      deliveryAvailable
    } = body;

    const foodService = await prisma.foodServiceListing.create({
      data: {
        serviceName,
        photos: photos || [],
        serviceType,
        priceRange,
        menuDetails,
        cuisineType: cuisineType || [],
        vegOptions: Boolean(vegOptions),
        nonVegOptions: Boolean(nonVegOptions),
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        contactInfo,
        description,
        operatingHours,
        deliveryAvailable: Boolean(deliveryAvailable),
        ownerId: (session.user as any).id
      }
    });

    return NextResponse.json(
      { foodService, message: "Food service listing created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating food service listing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
