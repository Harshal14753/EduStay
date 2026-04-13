
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { RoomType, AccommodationType } from "@prisma/client";
import { uploadLocalImages } from "@/lib/uploadImages";

export const dynamic = "force-dynamic";

const VALID_ROOM_TYPES = new Set(Object.values(RoomType));
const VALID_ACCOMMODATION_TYPES = new Set(Object.values(AccommodationType));

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;
    const userType = formData.get('userType') as string;
    const university = formData.get('university') as string;
    const stream = formData.get('stream') as string;
    const serviceType = formData.get('serviceType') as string;
    const propertyType = formData.get('propertyType') as string;
    const location = formData.get('location') as string;
    const nearbyUniversity = formData.get('nearbyUniversity') as string;
    const price = formData.get('price') as string;
    const minStayStr = formData.get('minStay') as string;
    const roomType = formData.get('roomType') as string;
    const capacity = formData.get('capacity') as string;
    const description = formData.get('description') as string;
    const images = formData.getAll('images') as File[];

    // Validate required fields
    if (!name || !email || !password || !phone || !userType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Normalize userType to uppercase
    const normalizedUserType = userType?.toUpperCase();
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        userType: normalizedUserType as any,
        university: normalizedUserType === 'STUDENT' ? university : null,
        stream: normalizedUserType === 'STUDENT' ? (stream as any) : null,
        serviceType: normalizedUserType === 'STUDENT' ? (serviceType as any) : null,
      }
    });

        // If property owner, create accommodation listing
    if (normalizedUserType === 'PROPERTY_OWNER' && propertyType && location) {
      // Upload images and get their URLs
      const imageUrls = await uploadLocalImages(images);

      const normalizedPropertyType = propertyType?.toUpperCase();
      const normalizedRoomType = roomType?.toUpperCase();

      if (!VALID_ACCOMMODATION_TYPES.has(normalizedPropertyType as AccommodationType)) {
        return NextResponse.json(
          { error: "Invalid property type selected." },
          { status: 400 }
        );
      }

      if (!VALID_ROOM_TYPES.has(normalizedRoomType as RoomType)) {
        return NextResponse.json(
          { error: "Invalid room type selected." },
          { status: 400 }
        );
      }
      
      // Convert and validate price and minStay
      const dailyRate = parseInt(price);
      const minStay = parseInt(minStayStr || '1');

      if (isNaN(dailyRate) || dailyRate <= 0) {
        return NextResponse.json(
          { error: "Invalid daily rate. Please enter a valid amount." },
          { status: 400 }
        );
      }

      if (isNaN(minStay) || minStay < 1) {
        return NextResponse.json(
          { error: "Minimum stay must be at least 1 day." },
          { status: 400 }
        );
      }

      await prisma.accommodationListing.create({
        data: {
          propertyName: name,
          photos: imageUrls,
          dailyRate,
          minStay,
          roomType: normalizedRoomType as RoomType,
          accommodationType: normalizedPropertyType as AccommodationType,
          address: location,
          description: description,
          nearbyUniversities: [nearbyUniversity],
          contactInfo: phone,
          foodPreference: 'BOTH',
          amenities: [],
          livingPreferences: [],
          ownerId: user.id
        }
      });
    }

    // Remove password from response
    const { password: _, ...userResponse } = user;

    return NextResponse.json(
      { user: userResponse, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
