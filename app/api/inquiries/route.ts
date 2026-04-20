import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const isInquiryMessagesValidationError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "";
  return (
    error instanceof Prisma.PrismaClientValidationError ||
    message.includes("Unknown arg `inquiryMessages`") ||
    message.includes("Unknown field `inquiryMessages`")
  );
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userType = (session.user as any)?.userType;
    if (userType !== "STUDENT") {
      return NextResponse.json({ error: "Only students can send inquiries" }, { status: 403 });
    }

    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const accommodationListingId =
      typeof body.accommodationListingId === "string" ? body.accommodationListingId : undefined;
    const foodServiceListingId =
      typeof body.foodServiceListingId === "string" ? body.foodServiceListingId : undefined;

    if (!message || message.length < 5) {
      return NextResponse.json({ error: "Message should be at least 5 characters" }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json({ error: "Message should be 1000 characters or less" }, { status: 400 });
    }

    if ((accommodationListingId && foodServiceListingId) || (!accommodationListingId && !foodServiceListingId)) {
      return NextResponse.json(
        { error: "Provide exactly one listing target (accommodation or food service)" },
        { status: 400 }
      );
    }

    if (accommodationListingId) {
      const listing = await prisma.accommodationListing.findUnique({
        where: { id: accommodationListingId },
        select: { id: true },
      });

      if (!listing) {
        return NextResponse.json({ error: "Accommodation listing not found" }, { status: 404 });
      }

      let inquiry;
      try {
        inquiry = await prisma.inquiry.create({
          data: {
            message,
            studentId: (session.user as any).id,
            studentName: session.user.name || "Student",
            studentEmail: session.user.email || "",
            studentPhone: ((session.user as any)?.phone as string) || "",
            accommodationListingId,
            inquiryMessages: {
              create: {
                sender: "STUDENT",
                message,
              },
            },
          },
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        });
      } catch (createError) {
        if (!isInquiryMessagesValidationError(createError)) {
          throw createError;
        }

        inquiry = await prisma.inquiry.create({
          data: {
            message,
            studentId: (session.user as any).id,
            studentName: session.user.name || "Student",
            studentEmail: session.user.email || "",
            studentPhone: ((session.user as any)?.phone as string) || "",
            accommodationListingId,
          },
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        });
      }

      return NextResponse.json({ inquiry, message: "Inquiry sent successfully" }, { status: 201 });
    }

    const listing = await prisma.foodServiceListing.findUnique({
      where: { id: foodServiceListingId as string },
      select: { id: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Food service listing not found" }, { status: 404 });
    }

    let inquiry;
    try {
      inquiry = await prisma.inquiry.create({
        data: {
          message,
          studentId: (session.user as any).id,
          studentName: session.user.name || "Student",
          studentEmail: session.user.email || "",
          studentPhone: ((session.user as any)?.phone as string) || "",
          foodServiceListingId: foodServiceListingId as string,
          inquiryMessages: {
            create: {
              sender: "STUDENT",
              message,
            },
          },
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      });
    } catch (createError) {
      if (!isInquiryMessagesValidationError(createError)) {
        throw createError;
      }

      inquiry = await prisma.inquiry.create({
        data: {
          message,
          studentId: (session.user as any).id,
          studentName: session.user.name || "Student",
          studentEmail: session.user.email || "",
          studentPhone: ((session.user as any)?.phone as string) || "",
          foodServiceListingId: foodServiceListingId as string,
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      });
    }

    return NextResponse.json({ inquiry, message: "Inquiry sent successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error sending inquiry:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
