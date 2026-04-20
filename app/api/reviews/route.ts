import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userType = (session.user as any)?.userType;
    if (userType !== "STUDENT") {
      return NextResponse.json({ error: "Only students can submit reviews" }, { status: 403 });
    }

    const body = await request.json();
    const rating = Number(body.rating);
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";
    const accommodationListingId =
      typeof body.accommodationListingId === "string" ? body.accommodationListingId : undefined;
    const foodServiceListingId =
      typeof body.foodServiceListingId === "string" ? body.foodServiceListingId : undefined;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    if ((accommodationListingId && foodServiceListingId) || (!accommodationListingId && !foodServiceListingId)) {
      return NextResponse.json(
        { error: "Provide exactly one target listing (accommodation or food service)" },
        { status: 400 }
      );
    }

    if (comment.length > 500) {
      return NextResponse.json({ error: "Comment must be 500 characters or less" }, { status: 400 });
    }

    if (accommodationListingId) {
      const listing = await prisma.accommodationListing.findUnique({
        where: { id: accommodationListingId },
        select: { id: true },
      });

      if (!listing) {
        return NextResponse.json({ error: "Accommodation not found" }, { status: 404 });
      }

      const existing = await prisma.review.findFirst({
        where: {
          userId: (session.user as any).id,
          accommodationListingId,
        },
      });

      const review = existing
        ? await prisma.review.update({
            where: { id: existing.id },
            data: {
              rating,
              comment: comment || null,
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          })
        : await prisma.review.create({
            data: {
              rating,
              comment: comment || null,
              userId: (session.user as any).id,
              accommodationListingId,
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });

      return NextResponse.json({
        review,
        message: existing ? "Review updated successfully" : "Review submitted successfully",
      });
    }

    const listing = await prisma.foodServiceListing.findUnique({
      where: { id: foodServiceListingId as string },
      select: { id: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Food service not found" }, { status: 404 });
    }

    const existing = await prisma.review.findFirst({
      where: {
        userId: (session.user as any).id,
        foodServiceListingId: foodServiceListingId as string,
      },
    });

    const review = existing
      ? await prisma.review.update({
          where: { id: existing.id },
          data: {
            rating,
            comment: comment || null,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        })
      : await prisma.review.create({
          data: {
            rating,
            comment: comment || null,
            userId: (session.user as any).id,
            foodServiceListingId: foodServiceListingId as string,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

    return NextResponse.json({
      review,
      message: existing ? "Review updated successfully" : "Review submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
