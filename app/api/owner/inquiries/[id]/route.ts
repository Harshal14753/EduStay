import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["PENDING", "RESPONDED", "CLOSED"] as const;

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
      return NextResponse.json({ error: "Only owners can update inquiries" }, { status: 403 });
    }

    const inquiryId = params.id;
    const ownerId = (session.user as any)?.id as string;
    const body = await request.json();

    const status = typeof body.status === "string" ? body.status : undefined;
    const responseText = typeof body.response === "string" ? body.response.trim() : undefined;

    if (status && !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json({ error: "Invalid inquiry status" }, { status: 400 });
    }

    const existingInquiry = await prisma.inquiry.findFirst({
      where: {
        id: inquiryId,
        OR: [
          { accommodationListing: { ownerId } },
          { foodServiceListing: { ownerId } },
        ],
      },
      select: {
        id: true,
        response: true,
      },
    });

    if (!existingInquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    const updateData: { status?: "PENDING" | "RESPONDED" | "CLOSED"; response?: string | null } = {};

    if (status) {
      updateData.status = status as "PENDING" | "RESPONDED" | "CLOSED";
    }

    const hasNewResponseMessage = responseText !== undefined && responseText.length > 0;
    const inquiryMessageDelegate = (prisma as any).inquiryMessage;
    const canCreateInquiryMessage =
      hasNewResponseMessage && inquiryMessageDelegate && typeof inquiryMessageDelegate.create === "function";

    if (responseText !== undefined) {
      if (responseText.length === 0) {
        updateData.response = null;
      } else if (canCreateInquiryMessage) {
        // Keep a latest snapshot when normalized message history is available.
        updateData.response = responseText;
      } else {
        // Fallback mode: append into response so previous owner replies stay visible.
        const previous = existingInquiry.response?.trim();
        const stamped = `[${new Date().toISOString()}] ${responseText}`;
        updateData.response = previous ? `${previous}\n\n${stamped}` : stamped;
      }
    }

    if (!Object.keys(updateData).length) {
      return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
    }

    const [, inquiry] = await prisma.$transaction([
      ...(canCreateInquiryMessage
        ? [
            inquiryMessageDelegate.create({
              data: {
                inquiryId,
                sender: "OWNER",
                message: responseText as string,
              },
            }),
          ]
        : [
            prisma.inquiry.findUnique({
              where: { id: inquiryId },
              select: { id: true },
            }),
          ]),
      prisma.inquiry.update({
        where: { id: inquiryId },
        data: updateData,
        select: {
          id: true,
          status: true,
          response: true,
          updatedAt: true,
        },
      }),
    ]);

    return NextResponse.json({ inquiry, message: "Inquiry updated successfully" });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
