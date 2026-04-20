import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const STREAM_VALUES = ["ENGINEERING", "MEDICAL"] as const;
const SERVICE_TYPE_VALUES = ["ACCOMMODATION", "FOOD", "BOTH"] as const;
const BUSINESS_TYPE_VALUES = ["INDIVIDUAL", "COMPANY", "INSTITUTION"] as const;

function isValidPhone(phone: string) {
  return /^[0-9+\-\s()]{7,20}$/.test(phone);
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = (session.user as any)?.id as string;
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!name || name.length < 2 || name.length > 80) {
      return NextResponse.json({ error: "Name must be between 2 and 80 characters" }, { status: 400 });
    }

    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userType: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {
      name,
      phone,
    };

    if (currentUser.userType === "STUDENT") {
      const university = typeof body.university === "string" ? body.university.trim() : "";
      if (university.length > 120) {
        return NextResponse.json({ error: "University must be 120 characters or less" }, { status: 400 });
      }

      const stream = body.stream;
      if (stream !== null && stream !== undefined && !STREAM_VALUES.includes(stream)) {
        return NextResponse.json({ error: "Invalid stream value" }, { status: 400 });
      }

      const serviceType = body.serviceType;
      if (serviceType !== null && serviceType !== undefined && !SERVICE_TYPE_VALUES.includes(serviceType)) {
        return NextResponse.json({ error: "Invalid service type value" }, { status: 400 });
      }

      updateData.university = university || null;
      updateData.stream = stream ?? null;
      updateData.serviceType = serviceType ?? null;
    }

    if (currentUser.userType === "PROPERTY_OWNER") {
      const businessType = body.businessType;
      if (businessType !== null && businessType !== undefined && !BUSINESS_TYPE_VALUES.includes(businessType)) {
        return NextResponse.json({ error: "Invalid business type value" }, { status: 400 });
      }

      updateData.businessType = businessType ?? null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        userType: true,
        university: true,
        stream: true,
        serviceType: true,
        businessType: true,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
